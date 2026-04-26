from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, name, email, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            name=name,
            email=self.normalize_email(email),
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, name, email, password):
        user = self.create_user(
            name=name,
            email=email,
            password=password,
        )
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

    @property
    def id(self):
        return self.user_id

    def has_perm(self, perm, obj=None):
        return True

    def has_perms(self, perm_list, obj=None):
        return True

    def is_staff(self):
        return False

    @property
    def is_superuser(self):
        return False

    class Meta:
        db_table = 'Users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class Account(models.Model):
    account_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    account_name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=50)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'Accounts'
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'

    def __str__(self):
        return f"{self.account_name} ({self.account_type})"


class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=[('Income', 'Income'), ('Expense', 'Expense')])

    class Meta:
        db_table = 'Categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.name} ({self.type})"


class Transaction(models.Model):
    transaction_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=[('Income', 'Income'), ('Expense', 'Expense')])
    date = models.DateField()
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    tags = models.ManyToManyField('Tag', blank=True, related_name='transactions')

    class Meta:
        db_table = 'Transactions'
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} on {self.date}"


class Tag(models.Model):
    tag_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#3b82f6')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'Tags'
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'

    def __str__(self):
        return self.name


class Budget(models.Model):
    budget_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()

    class Meta:
        db_table = 'Budgets'
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'

    def __str__(self):
        return f"Budget for {self.category.name} - {self.amount} for {self.month.strftime('%Y-%m')}"


class Conversation(models.Model):
    conversation_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    user_message = models.TextField()
    ai_response = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'Conversations'
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-timestamp']

    def __str__(self):
        return f"Conversation {self.conversation_id} - {self.user.name} at {self.timestamp}"


class Reminder(models.Model):
    reminder_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    reminder_type = models.CharField(max_length=50, choices=[
        ('bill_payment', 'Bill Payment'),
        ('recurring_expense', 'Recurring Expense'),
        ('budget_alert', 'Budget Alert'),
        ('seasonal', 'Seasonal Reminder')
    ])
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    vendor = models.CharField(max_length=100, blank=True, null=True)
    recurring = models.BooleanField(default=False)
    recurring_frequency = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly')
    ], blank=True, null=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'Reminders'
        verbose_name = 'Reminder'
        verbose_name_plural = 'Reminders'
        ordering = ['due_date']

    def __str__(self):
        return f"{self.title} - {self.due_date}"


class Forecast(models.Model):
    forecast_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    forecast_type = models.CharField(max_length=50, choices=[
        ('expense', 'Expense Forecast'),
        ('income', 'Income Forecast'),
        ('cashflow', 'Cash Flow Forecast'),
        ('budget', 'Budget Forecast')
    ])
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True)
    period_start = models.DateField()
    period_end = models.DateField()
    predicted_amount = models.DecimalField(max_digits=10, decimal_places=2)
    confidence_score = models.FloatField(default=0.0)  # 0-1 score
    actual_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    accuracy = models.FloatField(blank=True, null=True)  # Calculated after period
    factors = models.JSONField(blank=True, null=True)  # Contributing factors
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'Forecasts'
        verbose_name = 'Forecast'
        verbose_name_plural = 'Forecasts'
        ordering = ['-period_start']

    def __str__(self):
        return f"{self.forecast_type} - {self.predicted_amount} ({self.period_start} to {self.period_end})"


class Anomaly(models.Model):
    anomaly_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, blank=True, null=True)
    anomaly_type = models.CharField(max_length=50, choices=[
        ('unusual_amount', 'Unusual Amount'),
        ('duplicate_charge', 'Duplicate Charge'),
        ('unusual_vendor', 'Unusual Vendor'),
        ('unusual_category', 'Unusual Category'),
        ('unusual_time', 'Unusual Time'),
        ('budget_exceeded', 'Budget Exceeded')
    ])
    severity = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical')
    ])
    description = models.TextField()
    confidence_score = models.FloatField(default=0.0)  # 0-1 score
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'Anomalies'
        verbose_name = 'Anomaly'
        verbose_name_plural = 'Anomalies'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.anomaly_type} - {self.severity} ({self.confidence_score:.2f})"


class RecurringTransaction(models.Model):
    recurring_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=[('Income', 'Income'), ('Expense', 'Expense')])
    description = models.CharField(max_length=255, blank=True, null=True)
    frequency = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Biweekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly')
    ])
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    next_due_date = models.DateField()
    active = models.BooleanField(default=True)
    auto_create = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'RecurringTransactions'
        verbose_name = 'Recurring Transaction'
        verbose_name_plural = 'Recurring Transactions'
        ordering = ['next_due_date']

    def __str__(self):
        return f"Recurring {self.transaction_type} - {self.amount} ({self.frequency})"


class SavingsGoal(models.Model):
    goal_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deadline = models.DateField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=7, blank=True, null=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'SavingsGoals'
        verbose_name = 'Savings Goal'
        verbose_name_plural = 'Savings Goals'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.current_amount} / {self.target_amount}"

    @property
    def progress_percentage(self):
        if self.target_amount > 0:
            return round((float(self.current_amount) / float(self.target_amount)) * 100, 1)
        return 0.0

    @property
    def remaining_amount(self):
        return float(self.target_amount - self.current_amount)


class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    message = models.TextField()
    read = models.BooleanField(default=False)
    data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'Notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.notification_type}"
