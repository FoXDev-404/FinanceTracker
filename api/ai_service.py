import os
import json
import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from django.conf import settings
from django.db.models import Q, Sum, Avg, Count
from django.utils import timezone
import openai
from fuzzywuzzy import fuzz
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    spacy = None

# Conditional imports for optional dependencies
try:
    from transformers import pipeline
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    pipeline = None
    torch = None

logger = logging.getLogger(__name__)

class AIService:
    """Advanced AI service for finance management operations."""

    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.nlp = None
        self.category_classifier = None
        self._load_models()

    def _load_models(self):
        """Load pre-trained models and initialize NLP."""
        if SPACY_AVAILABLE:
            try:
                # Load spaCy model for NLP tasks
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found. Run: python -m spacy download en_core_web_sm")

        # Load category classification model if exists
        model_path = os.path.join(settings.BASE_DIR, 'api', 'models', 'category_classifier.pkl')
        if os.path.exists(model_path):
            self.category_classifier = joblib.load(model_path)



    def categorize_vendor(self, vendor: str, user) -> Dict[str, Any]:
        """Categorize vendor using ML and pattern matching."""
        if not vendor:
            return {'category': None, 'confidence': 0.0}

        # Get user's existing vendor-category mappings
        from .models import Transaction, Category
        vendor_patterns = Transaction.objects.filter(
            user=user,
            note__icontains=vendor
        ).values('category__name').annotate(
            count=Count('transaction_id')
        ).order_by('-count')[:5]

        if vendor_patterns:
            top_category = vendor_patterns[0]['category__name']
            confidence = min(0.9, vendor_patterns[0]['count'] / 10.0)  # Scale confidence
            return {'category': top_category, 'confidence': confidence}

        # Use AI for categorization
        return self._ai_categorize_vendor(vendor, user)

    def categorize_item(self, item_name: str, vendor: str, user) -> Dict[str, Any]:
        """Categorize individual items."""
        if not item_name:
            return {'category': None, 'confidence': 0.0}

        # Simple keyword-based categorization
        item_lower = item_name.lower()

        # Food keywords
        if any(keyword in item_lower for keyword in ['coffee', 'latte', 'espresso', 'cappuccino', 'sandwich', 'burger', 'pizza', 'pasta', 'salad']):
            return {'category': 'Food & Dining', 'confidence': 0.8}

        # Grocery keywords
        if any(keyword in item_lower for keyword in ['milk', 'bread', 'eggs', 'cheese', 'meat', 'vegetable', 'fruit']):
            return {'category': 'Groceries', 'confidence': 0.8}

        # Transportation keywords
        if any(keyword in item_lower for keyword in ['gas', 'fuel', 'parking', 'toll', 'uber', 'lyft', 'taxi']):
            return {'category': 'Transportation', 'confidence': 0.8}

        # Use AI for complex categorization
        return self._ai_categorize_item(item_name, vendor, user)

    def _ai_categorize_vendor(self, vendor: str, user) -> Dict[str, Any]:
        """Use AI to categorize vendor."""
        try:
            from .models import Category
            user_categories = list(Category.objects.filter(user=user).values_list('name', flat=True))

            prompt = f"""Categorize this vendor/business: "{vendor}"

Available categories: {', '.join(user_categories)}

Return only the most appropriate category name and confidence score (0-1) as JSON:
{{"category": "Category Name", "confidence": 0.8}}"""

            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100
            )

            result = json.loads(response.choices[0].message.content.strip())
            return result

        except Exception as e:
            logger.error(f"AI vendor categorization failed: {e}")
            return {'category': 'Uncategorized', 'confidence': 0.1}

    def _ai_categorize_item(self, item_name: str, vendor: str, user) -> Dict[str, Any]:
        """Use AI to categorize item."""
        try:
            from .models import Category
            user_categories = list(Category.objects.filter(user=user).values_list('name', flat=True))

            prompt = f"""Categorize this item: "{item_name}" from vendor "{vendor}"

Available categories: {', '.join(user_categories)}

Return only the most appropriate category name and confidence score (0-1) as JSON:
{{"category": "Category Name", "confidence": 0.8}}"""

            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100
            )

            result = json.loads(response.choices[0].message.content.strip())
            return result

        except Exception as e:
            logger.error(f"AI item categorization failed: {e}")
            return {'category': 'Uncategorized', 'confidence': 0.1}





    def detect_anomalies(self, user) -> List[Dict[str, Any]]:
        """Detect spending anomalies using statistical analysis."""
        from .models import Transaction

        # Get last 3 months of transactions
        three_months_ago = timezone.now() - timedelta(days=90)
        transactions = Transaction.objects.filter(
            user=user,
            date__gte=three_months_ago,
            transaction_type='Expense'
        ).order_by('date')

        if len(transactions) < 10:
            return []  # Need minimum data for anomaly detection

        # Convert to DataFrame for analysis
        df = pd.DataFrame(list(transactions.values('date', 'amount', 'category__name')))
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)

        anomalies = []

        # Daily spending anomalies
        daily_totals = df.resample('D')['amount'].sum()
        daily_mean = daily_totals.mean()
        daily_std = daily_totals.std()

        for date, amount in daily_totals.items():
            if amount > daily_mean + (3 * daily_std):  # 3-sigma rule
                anomalies.append({
                    'type': 'unusual_daily_spending',
                    'date': date.date(),
                    'amount': float(amount),
                    'expected': float(daily_mean),
                    'severity': 'high' if amount > daily_mean + (5 * daily_std) else 'medium'
                })

        # Category spending anomalies
        for category in df['category__name'].unique():
            category_data = df[df['category__name'] == category]['amount']
            if len(category_data) >= 5:
                cat_mean = category_data.mean()
                cat_std = category_data.std()

                recent_spending = category_data.tail(7).sum()  # Last week
                if recent_spending > cat_mean * 2:
                    anomalies.append({
                        'type': 'unusual_category_spending',
                        'category': category,
                        'amount': float(recent_spending),
                        'expected': float(cat_mean * 7),  # Weekly expectation
                        'severity': 'medium'
                    })

        return anomalies

    def generate_forecast(self, user, forecast_type: str = 'expense', periods: int = 3) -> Dict[str, Any]:
        """Generate financial forecasts using time series analysis."""
        from .models import Transaction

        # Get historical data
        one_year_ago = timezone.now() - timedelta(days=365)
        transactions = Transaction.objects.filter(
            user=user,
            date__gte=one_year_ago
        ).order_by('date')

        if len(transactions) < 30:
            return {'error': 'Insufficient data for forecasting'}

        df = pd.DataFrame(list(transactions.values('date', 'amount', 'transaction_type', 'category__name')))
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)

        forecasts = {}

        if forecast_type == 'expense':
            # Monthly expense forecasting
            monthly_expenses = df[df['transaction_type'] == 'Expense'].resample('M')['amount'].sum()

            if len(monthly_expenses) >= 6:
                # Simple linear trend
                x = np.arange(len(monthly_expenses))
                slope, intercept = np.polyfit(x, monthly_expenses.values, 1)

                forecast_values = []
                for i in range(1, periods + 1):
                    forecast_amount = slope * (len(monthly_expenses) + i) + intercept
                    forecast_date = monthly_expenses.index[-1] + pd.DateOffset(months=i)
                    forecast_values.append({
                        'date': forecast_date.date(),
                        'amount': max(0, float(forecast_amount)),  # Ensure non-negative
                        'confidence': max(0.1, 0.8 - (i * 0.1))  # Decreasing confidence
                    })

                forecasts['monthly_expenses'] = forecast_values

        elif forecast_type == 'cashflow':
            # Cash flow forecasting
            monthly_income = df[df['transaction_type'] == 'Income'].resample('M')['amount'].sum()
            monthly_expenses = df[df['transaction_type'] == 'Expense'].resample('M')['amount'].sum()
            monthly_net = monthly_income - monthly_expenses

            if len(monthly_net) >= 6:
                x = np.arange(len(monthly_net))
                slope, intercept = np.polyfit(x, monthly_net.values, 1)

                forecast_values = []
                for i in range(1, periods + 1):
                    forecast_amount = slope * (len(monthly_net) + i) + intercept
                    forecast_date = monthly_net.index[-1] + pd.DateOffset(months=i)
                    forecast_values.append({
                        'date': forecast_date.date(),
                        'amount': float(forecast_amount),
                        'confidence': max(0.1, 0.8 - (i * 0.1))
                    })

                forecasts['cash_flow'] = forecast_values

        return forecasts

    def process_voice_input(self, audio_text: str, user) -> Dict[str, Any]:
        """Process voice input for transaction creation."""
        try:
            prompt = f"""Parse this voice input into a financial transaction. Extract:
- Transaction type (Income or Expense)
- Amount
- Category
- Description/notes
- Date (if mentioned, otherwise use today)

Voice input: "{audio_text}"

Return as JSON with keys: type, amount, category, description, date"""

            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )

            result = json.loads(response.choices[0].message.content.strip())

            # Validate and enhance the parsed data
            result['amount'] = float(result.get('amount', 0))
            result['type'] = result.get('type', 'Expense').title()
            result['category'] = self.categorize_voice_transaction(result, user)
            result['confidence'] = 0.8  # Voice parsing confidence

            return result

        except Exception as e:
            logger.error(f"Voice processing failed: {e}")
            return {'error': 'Failed to process voice input'}

    def categorize_voice_transaction(self, transaction_data: Dict[str, Any], user) -> str:
        """Categorize transaction from voice input."""
        description = transaction_data.get('description', '')
        return self.categorize_item(description, '', user)['category'] or 'Uncategorized'

    def generate_budget_suggestions(self, user) -> List[Dict[str, Any]]:
        """Generate personalized budget suggestions based on spending patterns."""
        from .models import Transaction, Budget

        # Analyze spending patterns
        six_months_ago = timezone.now() - timedelta(days=180)
        spending_by_category = Transaction.objects.filter(
            user=user,
            transaction_type='Expense',
            date__gte=six_months_ago
        ).values('category__name').annotate(
            total=Sum('amount'),
            avg_monthly=Avg('amount')
        ).order_by('-total')

        suggestions = []

        for category_data in spending_by_category:
            category_name = category_data['category__name']
            avg_monthly = float(category_data['avg_monthly'])

            # Check existing budget
            existing_budget = Budget.objects.filter(
                user=user,
                category__name=category_name,
                month__month=timezone.now().month,
                month__year=timezone.now().year
            ).first()

            if not existing_budget:
                # Suggest budget based on spending pattern
                suggested_amount = avg_monthly * 1.1  # 10% buffer
                suggestions.append({
                    'category': category_name,
                    'suggested_amount': round(suggested_amount, 2),
                    'reason': f'Based on your average monthly spending of ${avg_monthly:.2f}'
                })

        return suggestions

    def generate_insights_summary(self, user) -> Dict[str, Any]:
        """Generate comprehensive financial insights."""
        from .models import Transaction, Account

        current_month = timezone.now().month
        current_year = timezone.now().year

        # Current month stats
        monthly_expenses = Transaction.objects.filter(
            user=user,
            transaction_type='Expense',
            date__month=current_month,
            date__year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0

        monthly_income = Transaction.objects.filter(
            user=user,
            transaction_type='Income',
            date__month=current_month,
            date__year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Previous month comparison
        prev_month = current_month - 1 if current_month > 1 else 12
        prev_year = current_year if current_month > 1 else current_year - 1

        prev_expenses = Transaction.objects.filter(
            user=user,
            transaction_type='Expense',
            date__month=prev_month,
            date__year=prev_year
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Top spending categories
        top_categories = Transaction.objects.filter(
            user=user,
            transaction_type='Expense',
            date__month=current_month,
            date__year=current_year
        ).values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')[:3]

        # Savings rate
        savings_rate = ((monthly_income - monthly_expenses) / monthly_income * 100) if monthly_income > 0 else 0

        insights = {
            'monthly_overview': {
                'income': float(monthly_income),
                'expenses': float(monthly_expenses),
                'net': float(monthly_income - monthly_expenses),
                'savings_rate': round(savings_rate, 1)
            },
            'trends': {
                'expense_change': round(((float(monthly_expenses) - float(prev_expenses)) / float(prev_expenses) * 100) if prev_expenses > 0 else 0, 1)
            },
            'top_categories': [
                {'category': item['category__name'], 'amount': float(item['total'])}
                for item in top_categories
            ],
            'recommendations': self.generate_recommendations(user, monthly_expenses, monthly_income)
        }

        return insights

    def generate_recommendations(self, user, monthly_expenses: float, monthly_income: float) -> List[str]:
        """Generate personalized financial recommendations."""
        recommendations = []

        # Savings recommendations
        if monthly_income > 0:
            savings_rate = ((monthly_income - monthly_expenses) / monthly_income) * 100
            if savings_rate < 20:
                recommendations.append("Consider saving at least 20% of your income for financial security.")
            elif savings_rate > 50:
                recommendations.append("Great job maintaining a high savings rate!")

        # Spending analysis
        if monthly_expenses > monthly_income * 0.9:
            recommendations.append("Your expenses are close to your income. Consider reviewing your budget.")

        # Category-specific recommendations
        from .models import Transaction
        current_month = timezone.now().month
        current_year = timezone.now().year

        dining_expenses = Transaction.objects.filter(
            user=user,
            category__name__icontains='food',
            transaction_type='Expense',
            date__month=current_month,
            date__year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0

        if dining_expenses > monthly_expenses * 0.3:
            recommendations.append("Food expenses are a large portion of your spending. Consider meal planning to save money.")

        return recommendations

# Global instance
ai_service = AIService()
