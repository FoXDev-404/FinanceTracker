from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from django.conf import settings
from django.db.models import Q, Sum
from datetime import datetime, timedelta
import openai
from decimal import Decimal
import pytesseract
from PIL import Image
import json
import speech_recognition as sr
from django.core.files.base import ContentFile
import base64

from .models import User, Account, Category, Transaction, Budget, Conversation, Reminder, Forecast, Anomaly
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, AccountSerializer, CategorySerializer, TransactionSerializer, BudgetSerializer
from .vision_service import vision_service
from .ai_service import ai_service


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    @extend_schema(
        summary="Register a new user",
        description="Create a new user account with name, email, and password",
        request=UserRegistrationSerializer,
        responses={
            201: UserSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}}
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer

    @extend_schema(
        summary="Login user",
        description="Authenticate user and return JWT tokens",
        request={
            "type": "object",
            "properties": {
                "email": {"type": "string", "format": "email"},
                "password": {"type": "string", "format": "password"}
            },
            "required": ["email", "password"]
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "refresh": {"type": "string"},
                    "access": {"type": "string"},
                    "user": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "integer"},
                            "name": {"type": "string"},
                            "email": {"type": "string"}
                        }
                    }
                }
            },
            401: {"type": "object", "properties": {"detail": {"type": "string"}}}
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class UserProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        summary="Get user profile",
        description="Get the authenticated user's profile information",
        responses={
            200: UserSerializer,
            401: {"type": "object", "properties": {"detail": {"type": "string"}}}
        }
    )
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    @extend_schema(
        summary="Update user profile",
        description="Update the authenticated user's profile information including profile picture",
        request=UserSerializer,
        responses={
            200: UserSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            401: {"type": "object", "properties": {"detail": {"type": "string"}}}
        }
    )
    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        summary="Logout user",
        description="Logout the authenticated user (client-side token removal)",
        responses={
            200: {"type": "object", "properties": {"message": {"type": "string"}}}
        }
    )
    def post(self, request):
        return Response({'message': 'Successfully logged out'})


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['-date']

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        transaction = serializer.save(user=self.request.user)
        # Update account balance
        account = transaction.account
        if transaction.transaction_type == 'Income':
            account.balance += transaction.amount
        elif transaction.transaction_type == 'Expense':
            account.balance -= transaction.amount
        account.save()

    def perform_update(self, serializer):
        # Get the old transaction before update
        old_transaction = self.get_object()
        old_account = old_transaction.account
        old_type = old_transaction.transaction_type
        old_amount = old_transaction.amount

        # Update the transaction
        transaction = serializer.save()

        # Adjust account balance
        account = transaction.account
        # Revert old transaction effect
        if old_type == 'Income':
            old_account.balance -= old_amount
        elif old_type == 'Expense':
            old_account.balance += old_amount

        # Apply new transaction effect
        if transaction.transaction_type == 'Income':
            account.balance += transaction.amount
        elif transaction.transaction_type == 'Expense':
            account.balance -= transaction.amount

        # Save accounts (if account changed, save both)
        if old_account != account:
            old_account.save()
        account.save()


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['-month']

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        budget = serializer.save(user=self.request.user)
        # Send email notification on budget creation
        self.send_budget_email(budget, created=True)

    def perform_update(self, serializer):
        budget = serializer.save()
        # Send email notification on budget update
        # self.send_budget_email(budget, created=False)

    def send_budget_email(self, budget, created):
        from django.core.mail import send_mail
        subject = 'Budget Created' if created else 'Budget Updated'
        message = f'Your budget for category "{budget.category.name}" for month {budget.month} has been {"created" if created else "updated"} with amount ${budget.amount}.'
        recipient_list = [budget.user.email]
        send_mail(subject, message, 'no-reply@financetracker.com', recipient_list)






class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="AI Finance Assistant Chat",
        description="Interact with the AI Finance Assistant to get financial insights.",
        request={
            "type": "object",
            "properties": {
                "message": {"type": "string", "description": "User's message to the AI assistant."}
            },
            "required": ["message"]
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "response": {"type": "string"}
                }
            },
            400: {"type": "object", "properties": {"error": {"type": "string"}}}
        }
    )
    def post(self, request):
        user_message = request.data.get('message')
        if not user_message:
            return Response({"error": "Message not provided"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user

        # Fetch user data for context
        user_data = self.get_user_financial_data(user)

        # Get conversation history (last 10 messages for context)
        conversation_history = Conversation.objects.filter(user=user).order_by('-timestamp')[:10]
        history = []
        for conv in reversed(conversation_history):
            history.append({"role": "user", "content": conv.user_message})
            history.append({"role": "assistant", "content": conv.ai_response})

        # Build prompt for OpenAI
        system_prompt = f"""You are a helpful AI Finance Assistant for {user.name}. You have access to their financial data and can answer questions about their finances naturally and conversationally.

User's Financial Data Summary:
{user_data}

Guidelines:
- Answer questions based on the provided data.
- Be conversational and helpful.
- If data is missing, suggest adding it.
- For comparisons, calculations, or plans, use the data provided.
- Keep responses concise but informative.
- Provide personalized financial advice and recommendations based on the user's data, including investment suggestions.
- Handle vague queries by asking for clarification or providing relevant insights.
- Support follow-ups by referencing previous context.
"""

        messages = [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": user_message}]

        try:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            ai_response = response.choices[0].message.content.strip() if response.choices[0].message.content else "I'm sorry, I couldn't generate a response at the moment."
        except Exception as e:
            # Intelligent fallback: Analyze query and provide relevant financial insights
            ai_response = self.generate_intelligent_fallback_response(user_message, user)

        # Ensure ai_response is not None or empty
        if not ai_response:
            ai_response = "I'm sorry, I couldn't generate a response at the moment."

        # Save conversation to database
        Conversation.objects.create(
            user=user,
            user_message=user_message,
            ai_response=ai_response
        )

        return Response({"response": ai_response}, status=status.HTTP_200_OK)

    def get_user_financial_data(self, user):
        """Compile user's financial data into a string for the AI prompt."""
        data_parts = []

        # Accounts
        accounts = Account.objects.filter(user=user)
        if accounts:
            account_summary = "\n".join([f"- {acc.account_name} ({acc.account_type}): ${acc.balance}" for acc in accounts])
            total_balance = sum(acc.balance for acc in accounts)
            data_parts.append(f"Accounts:\n{account_summary}\nTotal Balance: ${total_balance}")
        else:
            data_parts.append("Accounts: None")

        # Categories
        categories = Category.objects.filter(user=user)
        if categories:
            category_summary = "\n".join([f"- {cat.name} ({cat.type})" for cat in categories])
            data_parts.append(f"Categories:\n{category_summary}")
        else:
            data_parts.append("Categories: None")

        # Recent Transactions (last 20)
        transactions = Transaction.objects.filter(user=user).order_by('-date')[:20]
        if transactions:
            transaction_summary = "\n".join([
                f"- {t.date}: {t.category.name} - {t.transaction_type} ${t.amount} ({t.note or 'No note'})"
                for t in transactions
            ])
            data_parts.append(f"Recent Transactions:\n{transaction_summary}")
        else:
            data_parts.append("Recent Transactions: None")

        # Current Month Budgets
        current_month = datetime.now().month
        current_year = datetime.now().year
        budgets = Budget.objects.filter(user=user, month__month=current_month, month__year=current_year)
        if budgets:
            budget_summary = "\n".join([f"- {b.category.name}: ${b.amount}" for b in budgets])
            total_budget = sum(b.amount for b in budgets)
            data_parts.append(f"Current Month Budgets:\n{budget_summary}\nTotal Budget: ${total_budget}")
        else:
            data_parts.append("Current Month Budgets: None")

        # Spending by Category (current month)
        spending_by_category = Transaction.objects.filter(
            user=user,
            transaction_type='Expense',
            date__month=current_month,
            date__year=current_year
        ).values('category__name').annotate(total=Sum('amount')).order_by('-total')
        if spending_by_category:
            spending_summary = "\n".join([f"- {item['category__name']}: ${item['total']}" for item in spending_by_category])
            data_parts.append(f"Current Month Spending by Category:\n{spending_summary}")
        else:
            data_parts.append("Current Month Spending by Category: None")

        return "\n\n".join(data_parts)

    def generate_intelligent_fallback_response(self, user_message, user):
        """Generate intelligent fallback responses based on query analysis and user data."""
        import re
        from django.db.models import Sum, Avg, Count

        user_message_lower = user_message.lower()

        # Get current date info
        now = datetime.now()
        current_month = now.month
        current_year = now.year

        # Fetch user data
        accounts = Account.objects.filter(user=user)
        categories = Category.objects.filter(user=user)
        budgets = Budget.objects.filter(user=user, month__month=current_month, month__year=current_year)
        transactions = Transaction.objects.filter(user=user)

        # Use regex for more flexible matching
        def contains_any(patterns, text):
            return any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns)

        # Check if this is a follow-up to investment advice
        last_conversation = Conversation.objects.filter(user=user).order_by('-timestamp').first()
        if last_conversation and contains_any([r'\b(invest|stock|market|trading|portfolio|stocks|shares|money|where|should|put|allocate|funds)\b'], last_conversation.user_message.lower()):
            # Provide detailed investment advice for follow-ups
            return "Let me explain investment recommendations in more detail:\n\n1. **Diversify your portfolio**: This means spreading your investments across different asset classes to reduce risk. For example, don't put all your money in one stock.\n\n2. **Index funds and ETFs**: These are investment funds that track a market index. They're low-cost and provide broad market exposure. Think of them as a basket of many stocks.\n\n3. **Long-term investing**: Markets go up and down, but historically, they tend to go up over long periods. Don't panic sell during downturns.\n\n4. **Emergency fund first**: Before investing, make sure you have 3-6 months of expenses saved in a safe place like a high-yield savings account.\n\n5. **Start small**: You don't need a lot of money to start investing. Many platforms allow you to invest with as little as $1.\n\nRemember, investing involves risk, and past performance doesn't guarantee future results. Consider your risk tolerance and time horizon before investing."

        # Basic greetings and help
        if contains_any([r'\b(hello|hi|hey|good morning|good afternoon|good evening|what\'s up|howdy)\b'], user_message_lower):
            return f"Hello {user.name}! I'm your AI Finance Assistant. I can help you with questions about your accounts, spending, budgets, transactions, income, savings, predictions, and financial insights. What would you like to know?"

        if contains_any([r'\b(help|what can you do|capabilities|features)\b'], user_message_lower):
            return f"I'm here to help with your finances! I can answer questions about:\n- Your account balances and net worth\n- Spending patterns and expenses\n- Budget tracking\n- Transaction history\n- Income analysis\n- Savings recommendations\n- Financial predictions and comparisons\n- And much more! Just ask me anything about your money."

        # Balance queries
        if contains_any([r'\b(balance|account balance|how much money|total balance|what\'s my balance|current balance)\b'], user_message_lower):
            if accounts:
                total_balance = sum(float(acc.balance) for acc in accounts)
                account_details = "\n".join([f"- {acc.account_name}: ${float(acc.balance):.2f}" for acc in accounts])
                return f"Your total balance is ${total_balance:.2f} across {len(accounts)} account(s):\n{account_details}"
            else:
                return "You don't have any accounts set up yet. Would you like to add one?"

        # Top spending categories
        if contains_any([r'\b(top spending|spending categories|most spent|highest expenses|where do I spend most)\b'], user_message_lower):
            spending_by_category = transactions.filter(
                transaction_type='Expense',
                date__month=current_month,
                date__year=current_year
            ).values('category__name').annotate(total=Sum('amount')).order_by('-total')[:5]

            if spending_by_category:
                category_list = "\n".join([
                    f"- {item['category__name']}: ${float(item['total']):.2f}"
                    for item in spending_by_category
                ])
                return f"Your top spending categories this month:\n{category_list}"
            else:
                return "You haven't recorded any expenses this month yet."

        # Spending queries
        if contains_any([r'\b(spend|spent|expense|expenses|cost|how much did I spend)\b'], user_message_lower):
            # Current month spending
            if contains_any([r'\b(this month|current month|monthly)\b'], user_message_lower) or not contains_any([r'\b(last month|previous month|october|november|december|january|february|march|april|may|june|july|august|september)\b'], user_message_lower):
                expenses = transactions.filter(transaction_type='Expense', date__month=current_month, date__year=current_year)
                if expenses:
                    total_spent = sum(float(exp.amount) for exp in expenses)
                    return f"This month, you've spent ${total_spent:.2f} across {len(expenses)} transactions."
                else:
                    return "You haven't recorded any expenses this month yet."

            # Last month spending
            elif contains_any([r'\b(last month|previous month)\b'], user_message_lower):
                last_month = current_month - 1 if current_month > 1 else 12
                last_year = current_year if current_month > 1 else current_year - 1
                expenses = transactions.filter(transaction_type='Expense', date__month=last_month, date__year=last_year)
                if expenses:
                    total_spent = sum(float(exp.amount) for exp in expenses)
                    return f"Last month, you spent ${total_spent:.2f} across {len(expenses)} transactions."
                else:
                    return "You didn't have any expenses recorded last month."

            # Specific month spending
            elif contains_any([r'\b(october|oct)\b'], user_message_lower):
                expenses = transactions.filter(transaction_type='Expense', date__month=10, date__year=current_year)
                if expenses:
                    total_spent = sum(float(exp.amount) for exp in expenses)
                    top_expenses = expenses.order_by('-amount')[:3]
                    expense_list = "\n".join([f"- {exp.category.name}: ${float(exp.amount):.2f}" for exp in top_expenses])
                    return f"In October, you spent ${total_spent:.2f} across {len(expenses)} transactions. Your top expenses were:\n{expense_list}"
                else:
                    return "You don't have any expenses recorded for October."

        # Category-specific queries
        category_keywords = {
            'food': [r'\b(food|restaurant|dining|eat|meal|grocery|supermarket)\b'],
            'travel': [r'\b(travel|trip|flight|hotel|vacation|airfare)\b'],
            'transport': [r'\b(transport|gas|car|bus|taxi|uber|parking|fuel)\b'],
            'entertainment': [r'\b(entertainment|movie|game|fun|cinema|theater)\b'],
            'shopping': [r'\b(shopping|clothes|store|buy|retail|mall)\b'],
            'utilities': [r'\b(utilities|electricity|water|gas bill|internet|phone)\b'],
            'healthcare': [r'\b(healthcare|medical|doctor|hospital|pharmacy|insurance)\b']
        }

        for category, patterns in category_keywords.items():
            if contains_any(patterns, user_message_lower):
                category_expenses = transactions.filter(
                    transaction_type='Expense',
                    category__name__icontains=category,
                    date__month=current_month,
                    date__year=current_year
                )
                if category_expenses:
                    total = sum(float(exp.amount) for exp in category_expenses)
                    return f"This month, you've spent ${total:.2f} on {category} across {len(category_expenses)} transactions."
                else:
                    return f"You haven't recorded any {category} expenses this month yet."

        # Budget queries
        if contains_any([r'\b(budget|budgets|limit|planning|budgeting)\b'], user_message_lower):
            if budgets:
                total_budget = sum(float(b.amount) for b in budgets)
                budget_details = "\n".join([f"- {b.category.name}: ${float(b.amount):.2f}" for b in budgets])
                return f"Your total budget for this month is ${total_budget:.2f} across {len(budgets)} categories:\n{budget_details}"
            else:
                return "You don't have any budgets set for this month. Would you like to create one?"

        # Transaction queries
        if contains_any([r'\b(transaction|transactions|recent|history|activity|activity log)\b'], user_message_lower):
            recent_transactions = transactions.order_by('-date')[:5]
            if recent_transactions:
                transaction_list = "\n".join([
                    f"- {t.date.strftime('%Y-%m-%d')}: {t.category.name} - ${float(t.amount):.2f} ({t.transaction_type})"
                    for t in recent_transactions
                ])
                return f"Here are your 5 most recent transactions:\n{transaction_list}"
            else:
                return "You don't have any transactions recorded yet."

        # Savings queries
        if contains_any([r'\b(save|saving|savings|save money|how to save|saving tips)\b'], user_message_lower):
            if accounts and budgets:
                total_balance = sum(float(acc.balance) for acc in accounts)
                total_budget = sum(float(b.amount) for b in budgets)
                monthly_income = transactions.filter(
                    transaction_type='Income',
                    date__month=current_month,
                    date__year=current_year
                ).aggregate(total=Sum('amount'))['total'] or 0
                monthly_income = float(monthly_income)

                suggested_savings = min(total_balance * 0.2, monthly_income * 0.3)
                return f"Based on your current balance of ${total_balance:.2f} and monthly income of ${monthly_income:.2f}, I suggest saving ${suggested_savings:.2f} per month (20% of balance or 30% of income, whichever is less)."
            else:
                return "To create a savings plan, I need to see your accounts and budgets. Please add some financial data first."

        # Comparison queries
        if contains_any([r'\b(compare|vs|versus|comparison|which is more)\b'], user_message_lower):
            # Compare food and travel by default, or parse specific categories
            food_expenses = transactions.filter(
                transaction_type='Expense',
                category__name__icontains='food',
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0

            travel_expenses = transactions.filter(
                transaction_type='Expense',
                category__name__icontains='travel',
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0

            food_total = float(food_expenses)
            travel_total = float(travel_expenses)

            if food_total > travel_total:
                comparison = f"You spend more on food (${food_total:.2f}) than travel (${travel_total:.2f})."
            elif travel_total > food_total:
                comparison = f"You spend more on travel (${travel_total:.2f}) than food (${food_total:.2f})."
            else:
                comparison = f"You spend equally on food and travel (${food_total:.2f} each)."

            return f"This month: Food expenses: ${food_total:.2f}, Travel expenses: ${travel_total:.2f}. {comparison}"

        # Receipt queries
        if contains_any([r'\b(receipt|receipts|mcdonald|starbucks|specific purchase)\b'], user_message_lower):
            mcdonalds_transactions = transactions.filter(
                category__name__icontains='food',
                note__icontains='mcdonald'
            ).order_by('-date')[:5]
            if mcdonalds_transactions:
                receipt_list = "\n".join([
                    f"- {t.date.strftime('%Y-%m-%d')}: ${float(t.amount):.2f} ({t.note or 'No details'})"
                    for t in mcdonalds_transactions
                ])
                return f"Here are your recent McDonald's receipts:\n{receipt_list}"
            else:
                return "I don't see any McDonald's transactions in your records."

        # Categories query
        if contains_any([r'\b(categories|category|types of expenses)\b'], user_message_lower):
            if categories:
                category_list = "\n".join([f"- {cat.name} ({cat.type})" for cat in categories])
                return f"Here are your categories:\n{category_list}"
            else:
                return "You don't have any categories set up yet. Would you like to add some?"

        # Why balance changed
        if contains_any([r'\b(why|what happened|changed)\b'], user_message_lower) and contains_any([r'\b(balance)\b'], user_message_lower):
            recent_expenses = transactions.filter(transaction_type='Expense').order_by('-date')[:3]
            if recent_expenses:
                expense_list = "\n".join([
                    f"- {exp.date.strftime('%Y-%m-%d')}: {exp.category.name} - ${float(exp.amount):.2f}"
                    for exp in recent_expenses
                ])
                return f"Your balance may have changed due to these recent expenses:\n{expense_list}"
            else:
                return "I don't see any recent expenses that would affect your balance."

        # Income queries
        if contains_any([r'\b(income|earn|earned|salary|revenue|paycheck|wage)\b'], user_message_lower):
            monthly_income = transactions.filter(
                transaction_type='Income',
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0
            monthly_income = float(monthly_income)

            if monthly_income > 0:
                return f"This month, you've earned ${monthly_income:.2f} in income."
            else:
                return "You haven't recorded any income this month yet."

        # Net worth queries
        if contains_any([r'\b(net worth|networth|total assets|wealth)\b'], user_message_lower):
            total_balance = sum(float(acc.balance) for acc in accounts) if accounts else 0
            return f"Your net worth is ${total_balance:.2f} (based on your account balances)."

        # Predictions and future queries
        if contains_any([r'\b(predict|forecast|next month|future|will I|estimate|projection)\b'], user_message_lower):
            # Simple prediction based on current trends
            current_expenses = transactions.filter(
                transaction_type='Expense',
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0
            current_expenses = float(current_expenses)

            last_month_expenses = transactions.filter(
                transaction_type='Expense',
                date__month=current_month-1 if current_month > 1 else 12,
                date__year=current_year if current_month > 1 else current_year-1
            ).aggregate(total=Sum('amount'))['total'] or 0
            last_month_expenses = float(last_month_expenses)

            if current_expenses > 0:
                avg_monthly = (current_expenses + last_month_expenses) / 2 if last_month_expenses > 0 else current_expenses
                return f"Based on your recent spending patterns, I estimate your expenses next month could be around ${avg_monthly:.2f}. This is just an estimate based on your current and previous month data."
            else:
                return "I don't have enough data to make predictions yet. Please add some transaction data first."

        # Investment/Stock queries
        if contains_any([r'\b(invest|stock|market|trading|portfolio|stocks|shares|money|where|should|put|allocate|funds)\b'], user_message_lower):
            total_balance = sum(float(acc.balance) for acc in accounts) if accounts else 0
            monthly_income = transactions.filter(
                transaction_type='Income',
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0
            monthly_income = float(monthly_income)

            # Conversational general advice
            general_advice = "Hey, investing can be a smart way to grow your money over time! Here's what I'd recommend to get started:\n\n• **Diversify your portfolio** - Don't put all your eggs in one basket. Spread your investments across different types like stocks, bonds, and maybe some real estate.\n\n• **Try index funds or ETFs** - These are perfect for beginners. They're low-cost and give you exposure to the whole market without picking individual stocks.\n\n• **Think long-term** - Markets go up and down, but historically they trend upward. Focus on holding for years, not days.\n\n• **Build an emergency fund first** - Make sure you have 3-6 months of expenses saved in a safe place before diving into investments.\n\n• **Start small** - You don't need a ton of money. Many apps let you invest with just $1 to begin.\n\n"

            if total_balance > 0 and monthly_income > 0:
                # Add personalized recommendations
                investable_amount = min(total_balance * 0.5, monthly_income * 0.2)  # Conservative approach
                personalized = f"Looking at your finances, with a balance of ${total_balance:.2f} and monthly income of ${monthly_income:.2f}, I'd suggest investing up to ${investable_amount:.2f} per month. Something like 60% stocks and 40% bonds could work well for your situation."
                return general_advice + personalized + "\n\nRemember, this is just general advice - definitely chat with a financial advisor for your specific needs!"
            elif total_balance > 0:
                investable_amount = total_balance * 0.3
                personalized = f"With your current balance of ${total_balance:.2f}, you could start by investing up to ${investable_amount:.2f} in diversified options. Maybe begin with some stable ETFs or bonds to keep it low-risk."
                return general_advice + personalized + "\n\nAs always, consult a financial advisor for personalized recommendations."
            else:
                return general_advice + "To give you more tailored suggestions, it'd help if you added your account balances and income info to your profile. In the meantime, talk to a financial advisor for advice that fits your situation."

        # Retirement savings queries
        if contains_any([r'\b(retirement|retire|pension|long term saving|401k|ira)\b'], user_message_lower):
            total_balance = sum(float(acc.balance) for acc in accounts) if accounts else 0
            monthly_income = transactions.filter(
                transaction_type='Income',
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0
            monthly_income = float(monthly_income)

            if total_balance > 0 and monthly_income > 0:
                suggested_retirement = monthly_income * 0.15  # General rule: 15% of income for retirement
                return f"For retirement planning, a common recommendation is to save 15% of your income. Based on your current monthly income of ${monthly_income:.2f}, that would be about ${suggested_retirement:.2f} per month. Please consult a financial advisor for personalized retirement planning."
            else:
                return "To provide retirement saving suggestions, I need to see your income and account data. Please add some financial information first."

        # Year-over-year comparisons
        if contains_any([r'\b(last year|year over year|compared to last year|vs last year|yearly comparison)\b'], user_message_lower):
            current_year_expenses = transactions.filter(
                transaction_type='Expense',
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0
            current_year_expenses = float(current_year_expenses)

            last_year_expenses = transactions.filter(
                transaction_type='Expense',
                date__year=current_year-1
            ).aggregate(total=Sum('amount'))['total'] or 0
            last_year_expenses = float(last_year_expenses)

            if current_year_expenses > 0 and last_year_expenses > 0:
                change = current_year_expenses - last_year_expenses
                change_percent = (change / last_year_expenses) * 100
                direction = "increased" if change > 0 else "decreased"
                return f"Year-over-year comparison: This year you've spent ${current_year_expenses:.2f}, compared to ${last_year_expenses:.2f} last year. Your spending has {direction} by ${abs(change):.2f} ({change_percent:.1f}%)."
            elif current_year_expenses > 0:
                return f"This year you've spent ${current_year_expenses:.2f}. I don't have data from last year to compare."
            else:
                return "I don't have enough data to make year-over-year comparisons yet."

        # Financial summary/overview
        if contains_any([r'\b(summary|overview|status|report|financial health|dashboard|snapshot)\b'], user_message_lower):
            total_balance = sum(float(acc.balance) for acc in accounts) if accounts else 0
            monthly_expenses = transactions.filter(
                transaction_type='Expense',
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0
            monthly_expenses = float(monthly_expenses)

            monthly_income = transactions.filter(
                transaction_type='Income',
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0
            monthly_income = float(monthly_income)

            return f"Financial Overview:\n- Total Balance: ${total_balance:.2f}\n- This Month's Income: ${monthly_income:.2f}\n- This Month's Expenses: ${monthly_expenses:.2f}\n- Net This Month: ${monthly_income - monthly_expenses:.2f}"

        # General financial advice or tips
        if contains_any([r'\b(advice|tip|tips|suggestion|suggestions|recommend|recommendation)\b'], user_message_lower):
            return f"Here are some general financial tips:\n1. Track your expenses regularly\n2. Set realistic budgets for different categories\n3. Build an emergency fund (aim for 3-6 months of expenses)\n4. Pay off high-interest debt first\n5. Save at least 20% of your income\n6. Diversify your income sources\n\nRemember, this is general advice. For personalized recommendations, consult a financial advisor."

        # Default response for unrecognized queries - more conversational
        # Try to extract key financial terms and provide relevant info
        financial_terms = ['money', 'cash', 'funds', 'finance', 'financial', 'spending', 'budget', 'saving', 'income', 'expense', 'transaction', 'account', 'balance']
        if any(term in user_message_lower for term in financial_terms):
            return f"I understand you're asking about your finances. I can help with questions about your balance, spending patterns, budgets, transactions, income, savings, and financial insights. Could you be more specific? For example, try asking 'What's my balance?' or 'How much did I spend this month?'"

        # Completely unrecognized - friendly fallback
        return f"I'm sorry, I didn't understand your question. I'm here to help with your finances! I can answer questions about your accounts, spending, budgets, transactions, income, savings, and more. What would you like to know?"


class SmartReceiptProcessingView(APIView):
    """AI-powered receipt processing with automatic categorization and insights."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Process receipt with AI",
        description="Upload and process a receipt image with AI categorization and insights.",
        request={
            "type": "object",
            "properties": {
                "image": {"type": "string", "format": "binary", "description": "Receipt image file"},
                "auto_create_transaction": {"type": "boolean", "description": "Automatically create transaction from receipt"}
            }
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "extracted_data": {"type": "object"},
                    "categorization": {"type": "object"},
                    "insights": {"type": "object"},
                    "duplicate_check": {"type": "object"},
                    "transaction_created": {"type": "boolean"}
                }
            }
        }
    )
    def post(self, request):
        image_file = request.FILES.get('image')
        auto_create = request.data.get('auto_create_transaction', False)

        if not image_file:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Process with vision service
            image_path = image_file.temporary_file_path() if hasattr(image_file, 'temporary_file_path') else image_file.file.name
            extracted_data = vision_service.extract_receipt_data(image_path)

            if 'error' in extracted_data:
                return Response({"error": extracted_data['error']}, status=status.HTTP_400_BAD_REQUEST)

            # AI processing
            ai_result = ai_service.extract_and_categorize_receipt(extracted_data, request.user)

            transaction_created = False
            if auto_create and 'error' not in ai_result:
                transaction_created = self.create_transaction_from_receipt(ai_result, request.user)

            return Response({
                "extracted_data": extracted_data,
                "categorization": {
                    "vendor": ai_result.get('vendor'),
                    "suggested_category": ai_result.get('suggested_category'),
                    "items": ai_result.get('items', [])
                },
                "insights": ai_result.get('insights', {}),
                "duplicate_check": ai_result.get('duplicate_check', {}),
                "confidence_score": ai_result.get('confidence_score', 0),
                "transaction_created": transaction_created
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create_transaction_from_receipt(self, ai_result, user):
        """Create transaction from AI-processed receipt data."""
        try:
            from .models import Transaction, Account, Category

            total = ai_result.get('total', 0)
            vendor = ai_result.get('vendor', 'Unknown Vendor')
            category_name = ai_result.get('suggested_category', {}).get('category', 'Uncategorized')

            # Get or create category
            category, _ = Category.objects.get_or_create(
                user=user,
                name=category_name,
                defaults={'type': 'Expense'}
            )

            # Get user's primary account
            account = Account.objects.filter(user=user).first()
            if not account:
                return False

            # Create transaction
            Transaction.objects.create(
                user=user,
                account=account,
                category=category,
                amount=Decimal(str(total)),
                transaction_type='Expense',
                date=ai_result.get('date', datetime.now().date()),
                note=f"Receipt: {vendor}"
            )

            # Update account balance
            account.balance -= Decimal(str(total))
            account.save()

            return True

        except Exception as e:
            print(f"Error creating transaction: {e}")
            return False


class VoiceTransactionView(APIView):
    """Process voice input for transaction creation."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Create transaction from voice",
        description="Process voice audio and create a transaction.",
        request={
            "type": "object",
            "properties": {
                "audio": {"type": "string", "format": "binary", "description": "Audio file"},
                "audio_base64": {"type": "string", "description": "Base64 encoded audio"}
            }
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "parsed_transaction": {"type": "object"},
                    "transaction_created": {"type": "boolean"}
                }
            }
        }
    )
    def post(self, request):
        audio_file = request.FILES.get('audio')
        audio_base64 = request.data.get('audio_base64')

        if not audio_file and not audio_base64:
            return Response({"error": "No audio provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Convert audio to text
            if audio_base64:
                audio_data = base64.b64decode(audio_base64)
                audio_file = ContentFile(audio_data, name='voice_input.wav')

            # Save temporary file
            temp_path = f'/tmp/{audio_file.name}'
            with open(temp_path, 'wb') as f:
                f.write(audio_file.read())

            # Speech recognition
            recognizer = sr.Recognizer()
            with sr.AudioFile(temp_path) as source:
                audio = recognizer.record(source)
                text = recognizer.recognize_google(audio)

            # Process with AI
            transaction_data = ai_service.process_voice_input(text, request.user)

            if 'error' in transaction_data:
                return Response({"error": transaction_data['error']}, status=status.HTTP_400_BAD_REQUEST)

            # Create transaction
            transaction_created = self.create_voice_transaction(transaction_data, request.user)

            return Response({
                "parsed_transaction": transaction_data,
                "transaction_created": transaction_created,
                "recognized_text": text
            })

        except Exception as e:
            return Response({"error": f"Voice processing failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create_voice_transaction(self, transaction_data, user):
        """Create transaction from voice-parsed data."""
        try:
            from .models import Transaction, Account, Category

            # Get or create category
            category_name = transaction_data.get('category', 'Uncategorized')
            category, _ = Category.objects.get_or_create(
                user=user,
                name=category_name,
                defaults={'type': transaction_data.get('type', 'Expense')}
            )

            # Get user's account
            account = Account.objects.filter(user=user).first()
            if not account:
                return False

            # Create transaction
            Transaction.objects.create(
                user=user,
                account=account,
                category=category,
                amount=Decimal(str(transaction_data.get('amount', 0))),
                transaction_type=transaction_data.get('type', 'Expense'),
                date=transaction_data.get('date', datetime.now().date()),
                note=f"Voice: {transaction_data.get('description', '')}"
            )

            # Update balance
            if transaction_data.get('type') == 'Income':
                account.balance += Decimal(str(transaction_data.get('amount', 0)))
            else:
                account.balance -= Decimal(str(transaction_data.get('amount', 0)))
            account.save()

            return True

        except Exception as e:
            print(f"Error creating voice transaction: {e}")
            return False


class AnomalyDetectionView(APIView):
    """Detect spending anomalies and unusual patterns."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get spending anomalies",
        description="Analyze spending patterns and detect anomalies.",
        responses={
            200: {
                "type": "object",
                "properties": {
                    "anomalies": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "type": {"type": "string"},
                                "date": {"type": "string"},
                                "amount": {"type": "number"},
                                "expected": {"type": "number"},
                                "severity": {"type": "string"}
                            }
                        }
                    }
                }
            }
        }
    )
    def get(self, request):
        try:
            anomalies = ai_service.detect_anomalies(request.user)
            return Response({"anomalies": anomalies})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForecastingView(APIView):
    """Financial forecasting and predictions."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get financial forecasts",
        description="Generate forecasts for expenses, income, and cash flow.",
        request={
            "type": "object",
            "properties": {
                "forecast_type": {"type": "string", "enum": ["expense", "income", "cashflow"]},
                "periods": {"type": "integer", "default": 3, "description": "Number of periods to forecast"}
            }
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "forecasts": {"type": "object"}
                }
            }
        }
    )
    def post(self, request):
        forecast_type = request.data.get('forecast_type', 'expense')
        periods = int(request.data.get('periods', 3))

        try:
            forecasts = ai_service.generate_forecast(request.user, forecast_type, periods)
            return Response({"forecasts": forecasts})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BudgetSuggestionsView(APIView):
    """AI-powered budget recommendations."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get budget suggestions",
        description="Generate personalized budget suggestions based on spending patterns.",
        responses={
            200: {
                "type": "object",
                "properties": {
                    "suggestions": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "category": {"type": "string"},
                                "suggested_amount": {"type": "number"},
                                "reason": {"type": "string"}
                            }
                        }
                    }
                }
            }
        }
    )
    def get(self, request):
        try:
            suggestions = ai_service.generate_budget_suggestions(request.user)
            return Response({"suggestions": suggestions})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FinancialInsightsView(APIView):
    """Comprehensive financial insights and summaries."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get financial insights",
        description="Generate comprehensive financial insights and recommendations.",
        responses={
            200: {
                "type": "object",
                "properties": {
                    "insights": {"type": "object"}
                }
            }
        }
    )
    def get(self, request):
        try:
            insights = ai_service.generate_insights_summary(request.user)
            return Response({"insights": insights})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DuplicateReceiptView(APIView):
    """Check for duplicate receipts."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Check receipt duplicates",
        description="Check if a receipt is a duplicate of existing ones.",
        request={
            "type": "object",
            "properties": {
                "receipt_data": {"type": "object", "description": "Receipt data to check"}
            },
            "required": ["receipt_data"]
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "is_duplicate": {"type": "boolean"},
                    "similar_receipts": {"type": "array"}
                }
            }
        }
    )
    def post(self, request):
        receipt_data = request.data.get('receipt_data')
        if not receipt_data:
            return Response({"error": "Receipt data required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            duplicate_info = ai_service.check_duplicate_receipt(receipt_data, request.user)
            return Response(duplicate_info)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SmartCategorizationView(APIView):
    """AI-powered transaction categorization."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Categorize transaction",
        description="Automatically categorize a transaction using AI.",
        request={
            "type": "object",
            "properties": {
                "description": {"type": "string", "description": "Transaction description"},
                "amount": {"type": "number", "description": "Transaction amount"},
                "vendor": {"type": "string", "description": "Vendor name"}
            },
            "required": ["description"]
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "suggested_category": {"type": "object"},
                    "confidence": {"type": "number"}
                }
            }
        }
    )
    def post(self, request):
        description = request.data.get('description')
        amount = request.data.get('amount')
        vendor = request.data.get('vendor', '')

        if not description:
            return Response({"error": "Description required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            category_suggestion = ai_service.categorize_item(description, vendor, request.user)
            return Response({
                "suggested_category": category_suggestion,
                "description": description,
                "vendor": vendor
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BatchReceiptProcessingView(APIView):
    """Process multiple receipts in batch."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Batch receipt processing",
        description="Upload and process multiple receipts at once.",
        request={
            "type": "object",
            "properties": {
                "images": {
                    "type": "array",
                    "items": {"type": "string", "format": "binary"}
                },
                "auto_create_transactions": {"type": "boolean", "default": False}
            }
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "results": {
                        "type": "array",
                        "items": {"type": "object"}
                    },
                    "summary": {"type": "object"}
                }
            }
        }
    )
    def post(self, request):
        images = request.FILES.getlist('images')
        auto_create = request.data.get('auto_create_transactions', False)

        if not images:
            return Response({"error": "No images provided"}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        total_processed = 0
        total_created = 0

        for image_file in images:
            try:
                # Process each image
                image_path = image_file.temporary_file_path() if hasattr(image_file, 'temporary_file_path') else image_file.file.name
                extracted_data = vision_service.extract_receipt_data(image_path)

                if 'error' not in extracted_data:
                    ai_result = ai_service.extract_and_categorize_receipt(extracted_data, request.user)
                    transaction_created = False

                    if auto_create and 'error' not in ai_result:
                        # Create transaction using the same method as SmartReceiptProcessingView
                        transaction_created = self.create_transaction_from_batch(ai_result, request.user)

                    results.append({
                        "filename": image_file.name,
                        "success": True,
                        "extracted_data": extracted_data,
                        "ai_analysis": ai_result,
                        "transaction_created": transaction_created
                    })

                    total_processed += 1
                    if transaction_created:
                        total_created += 1
                else:
                    results.append({
                        "filename": image_file.name,
                        "success": False,
                        "error": extracted_data['error']
                    })

            except Exception as e:
                results.append({
                    "filename": image_file.name,
                    "success": False,
                    "error": str(e)
                })

        return Response({
            "results": results,
            "summary": {
                "total_images": len(images),
                "processed_successfully": total_processed,
                "transactions_created": total_created
            }
        })

    def create_transaction_from_batch(self, ai_result, user):
        """Create transaction from batch processing (similar to SmartReceiptProcessingView)."""
        try:
            from .models import Transaction, Account, Category

            total = ai_result.get('total', 0)
            vendor = ai_result.get('vendor', 'Unknown Vendor')
            category_name = ai_result.get('suggested_category', {}).get('category', 'Uncategorized')

            category, _ = Category.objects.get_or_create(
                user=user,
                name=category_name,
                defaults={'type': 'Expense'}
            )

            account = Account.objects.filter(user=user).first()
            if not account:
                return False

            Transaction.objects.create(
                user=user,
                account=account,
                category=category,
                amount=Decimal(str(total)),
                transaction_type='Expense',
                date=ai_result.get('date', datetime.now().date()),
                note=f"Batch Receipt: {vendor}"
            )

            account.balance -= Decimal(str(total))
            account.save()

            return True

        except Exception as e:
            print(f"Error creating batch transaction: {e}")
            return False
