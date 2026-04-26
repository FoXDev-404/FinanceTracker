from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Account, Category, Transaction, Budget, Tag, RecurringTransaction, SavingsGoal, Notification, Reminder, Forecast, Anomaly


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'password_confirm')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['name'] = self.user.name
        data['email'] = self.user.email
        data['user_id'] = self.user.user_id
        return data


class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('user_id', 'name', 'email', 'profile_picture', 'created_at')
        read_only_fields = ('user_id', 'created_at')


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('account_id', 'account_name', 'account_type', 'balance', 'created_at', 'user')
        read_only_fields = ('account_id', 'created_at', 'user')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('category_id', 'name', 'type', 'user')
        read_only_fields = ('category_id', 'user')


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('tag_id', 'name', 'color', 'created_at')
        read_only_fields = ('tag_id', 'created_at', 'user')

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Tag name cannot be empty.")
        return value.strip()


class TransactionSerializer(serializers.ModelSerializer):
    account_id = serializers.PrimaryKeyRelatedField(source='account', queryset=Account.objects.all(), write_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source='category', queryset=Category.objects.all(), write_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(source='tags', queryset=Tag.objects.all(), write_only=True, many=True, required=False)
    tags = TagSerializer(read_only=True, many=True)

    account = AccountSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'request' in self.context and hasattr(self.context['request'], 'user') and self.context['request'].user.is_authenticated:
            user = self.context['request'].user
            self.fields['account_id'].queryset = Account.objects.filter(user=user)
            self.fields['category_id'].queryset = Category.objects.filter(user=user)
            self.fields['tag_ids'].queryset = Tag.objects.filter(user=user)
        else:
            self.fields['account_id'].queryset = Account.objects.none()
            self.fields['category_id'].queryset = Category.objects.none()
            self.fields['tag_ids'].queryset = Tag.objects.none()

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_date(self, value):
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Transaction date cannot be in the future.")
        return value

    class Meta:
        model = Transaction
        fields = ('account', 'category', 'account_id', 'category_id', 'amount', 'transaction_type', 'date', 'note', 'transaction_id', 'created_at', 'user', 'tags', 'tag_ids')
        read_only_fields = ('transaction_id', 'created_at', 'user', 'account', 'category', 'tags')


class BudgetSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(source='category', queryset=Category.objects.all(), write_only=True)
    category = CategorySerializer(read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'request' in self.context and hasattr(self.context['request'], 'user') and self.context['request'].user.is_authenticated:
            user = self.context['request'].user
            self.fields['category_id'].queryset = Category.objects.filter(user=user)
        else:
            self.fields['category_id'].queryset = Category.objects.none()

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budget amount must be greater than zero.")
        return value

    def validate_month(self, value):
        from django.utils import timezone
        current_month = timezone.now().date().replace(day=1)
        if self.instance is None and value < current_month:
            raise serializers.ValidationError("Budget month cannot be in the past.")
        return value

    class Meta:
        model = Budget
        fields = ('budget_id', 'category', 'category_id', 'amount', 'month', 'user')
        read_only_fields = ('budget_id', 'user', 'category')


class RecurringTransactionSerializer(serializers.ModelSerializer):
    account_id = serializers.PrimaryKeyRelatedField(source='account', queryset=Account.objects.all(), write_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source='category', queryset=Category.objects.all(), write_only=True)

    account = AccountSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'request' in self.context and hasattr(self.context['request'], 'user') and self.context['request'].user.is_authenticated:
            user = self.context['request'].user
            self.fields['account_id'].queryset = Account.objects.filter(user=user)
            self.fields['category_id'].queryset = Category.objects.filter(user=user)
        else:
            self.fields['account_id'].queryset = Account.objects.none()
            self.fields['category_id'].queryset = Category.objects.none()

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    class Meta:
        model = RecurringTransaction
        fields = ('recurring_id', 'account', 'category', 'account_id', 'category_id', 'amount', 'transaction_type', 'description', 'frequency', 'start_date', 'end_date', 'next_due_date', 'active', 'auto_create', 'created_at')
        read_only_fields = ('recurring_id', 'created_at', 'user', 'account', 'category')


class SavingsGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()

    class Meta:
        model = SavingsGoal
        fields = ('goal_id', 'name', 'description', 'target_amount', 'current_amount', 'remaining_amount', 'progress_percentage', 'deadline', 'icon', 'color', 'active', 'created_at')
        read_only_fields = ('goal_id', 'created_at', 'user')


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('notification_id', 'notification_type', 'title', 'message', 'read', 'data', 'created_at')
        read_only_fields = ('notification_id', 'created_at', 'user', 'notification_type', 'title', 'message', 'data')


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ('reminder_id', 'title', 'description', 'reminder_type', 'due_date', 'amount', 'vendor', 'recurring', 'recurring_frequency', 'active', 'created_at')
        read_only_fields = ('reminder_id', 'created_at', 'user')


class ForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forecast
        fields = ('forecast_id', 'forecast_type', 'category', 'period_start', 'period_end', 'predicted_amount', 'confidence_score', 'actual_amount', 'accuracy', 'factors', 'created_at')
        read_only_fields = ('forecast_id', 'created_at', 'user')


class AnomalySerializer(serializers.ModelSerializer):
    class Meta:
        model = Anomaly
        fields = ('anomaly_id', 'transaction', 'anomaly_type', 'severity', 'description', 'confidence_score', 'resolved', 'resolved_at', 'created_at')
        read_only_fields = ('anomaly_id', 'created_at', 'user')
