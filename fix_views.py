import sys

with open('api/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

broken = 'f"- {t.date}:\n'
if broken in content:
    idx = content.index(broken)
    content = content[:idx]
    
    ending = '''                f"- {t.date}: {t.category.name} - {t.transaction_type} ${t.amount} ({t.note or 'No note'})"
                for t in transactions
            ])
            data_parts.append(f"Recent Transactions:\\n{transaction_summary}")
        else:
            data_parts.append("Recent Transactions: None")

        current_month = datetime.now().month
        current_year = datetime.now().year
        budgets = Budget.objects.filter(user=user, month__month=current_month, month__year=current_year)
        if budgets:
            budget_summary = "\\n".join([f"- {b.category.name}: ${b.amount}" for b in budgets])
            total_budget = sum(b.amount for b in budgets)
            data_parts.append(f"Current Month Budgets:\\n{budget_summary}\\nTotal Budget: ${total_budget}")
        else:
            data_parts.append("Current Month Budgets: None")

        spending_by_category = Transaction.objects.filter(
            user=user,
            transaction_type='Expense',
            date__month=current_month,
            date__year=current_year
        ).values('category__name').annotate(total=Sum('amount')).order_by('-total')
        if spending_by_category:
            spending_summary = "\\n".join([f"- {item['category__name']}: ${item['total']}" for item in spending_by_category])
            data_parts.append(f"Current Month Spending by Category:\\n{spending_summary}")
        else:
            data_parts.append("Current Month Spending by Category: None")

        return "\\n\\n".join(data_parts)

    def generate_intelligent_fallback_response(self, user_message, user):
        user_message_lower = user_message.lower()
        now = datetime.now()
        current_month = now.month
        current_year = now.year
        accounts = Account.objects.filter(user=user)
        transactions = Transaction.objects.filter(user=user)

        if any(k in user_message_lower for k in ['hello', 'hi', 'hey']):
            return f"Hello {user.name}! I'm your AI Finance Assistant. What would you like to know?"

        if any(k in user_message_lower for k in ['balance', 'how much money', 'total balance']):
            if accounts:
                total_balance = sum(float(acc.balance) for acc in accounts)
                return f"Your total balance is ${total_balance:.2f}."
            return "You don't have any accounts set up yet."

        if any(k in user_message_lower for k in ['spend', 'spent', 'expense', 'how much did I spend']):
            expenses = transactions.filter(transaction_type='Expense', date__month=current_month, date__year=current_year)
            if expenses:
                total_spent = sum(float(exp.amount) for exp in expenses)
                return f"This month, you've spent ${total_spent:.2f}."
            return "You haven't recorded any expenses this month yet."

        if any(k in user_message_lower for k in ['budget', 'budgets']):
            budgets = Budget.objects.filter(user=user, month__month=current_month, month__year=current_year)
            if budgets:
                total_budget = sum(float(b.amount) for b in budgets)
                return f"Your total budget for this month is ${total_budget:.2f}."
            return "You don't have any budgets set for this month."

        if any(k in user_message_lower for k in ['income', 'earn', 'salary']):
            monthly_income = transactions.filter(
                transaction_type='Income',
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0
            if monthly_income:
                return f"This month, you've earned ${float(monthly_income):.2f} in income."
            return "You haven't recorded any income this month yet."

        return "I'm here to help with your finances! Ask me about your balance, spending, budgets, or transactions."
'''
    content += ending
    
    with open('api/views.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed views.py successfully')
else:
    print('Broken pattern not found')
    sys.exit(1)
