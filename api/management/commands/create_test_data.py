from django.core.management.base import BaseCommand
from django.utils.timezone import now
from api.models import User, Account, Category, Budget
from datetime import date

class Command(BaseCommand):
    help = 'Create test accounts and budgets for the current month'

    def handle(self, *args, **kwargs):
        # Create or get test user
        user, created = User.objects.get_or_create(
            email='testuser@example.com',
            defaults={'name': 'Test User'}
        )
        if created:
            user.set_password('testpassword123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created test user'))

        # Create test accounts
        account1, _ = Account.objects.get_or_create(
            user=user,
            account_name='Test Checking Account',
            defaults={'balance': 5000.00}
        )
        account2, _ = Account.objects.get_or_create(
            user=user,
            account_name='Test Savings Account',
            defaults={'balance': 10000.00}
        )
        self.stdout.write(self.style.SUCCESS('Created test accounts'))

        # Create test categories
        category1, _ = Category.objects.get_or_create(
            user=user,
            name='Food',
            defaults={'type': 'Expense'}
        )
        category2, _ = Category.objects.get_or_create(
            user=user,
            name='Salary',
            defaults={'type': 'Income'}
        )
        self.stdout.write(self.style.SUCCESS('Created test categories'))

        # Create test budgets for current month
        current_month = date.today().replace(day=1)
        budget1, _ = Budget.objects.get_or_create(
            user=user,
            category=category1,
            month=current_month,
            defaults={'amount': 300.00}
        )
        budget2, _ = Budget.objects.get_or_create(
            user=user,
            category=category2,
            month=current_month,
            defaults={'amount': 5000.00}
        )
        self.stdout.write(self.style.SUCCESS('Created test budgets for current month'))
