from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, UserProfileView, LogoutView,
    AccountViewSet, CategoryViewSet, TagViewSet, TransactionViewSet, BudgetViewSet,
    RecurringTransactionViewSet, SavingsGoalViewSet, NotificationViewSet,
    ReminderViewSet, ForecastViewSet, AnomalyViewSet,
    DashboardStatsView, BudgetAlertsView, TransactionExportView,
    ChatView, VoiceInputView, ReceiptProcessView
)

app_name = 'api'

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'budgets', BudgetViewSet)
router.register(r'recurring-transactions', RecurringTransactionViewSet)
router.register(r'savings-goals', SavingsGoalViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'reminders', ReminderViewSet)
router.register(r'forecasts', ForecastViewSet)
router.register(r'anomalies', AnomalyViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Dashboard & Analytics (must be BEFORE router.urls to avoid being shadowed by detail regex)
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('budgets/alerts/', BudgetAlertsView.as_view(), name='budget_alerts'),
    path('transactions/export/', TransactionExportView.as_view(), name='transaction_export'),

    path('', include(router.urls)),

    # AI Features
    path('chat/', ChatView.as_view(), name='chat'),
    path('voice/', VoiceInputView.as_view(), name='voice_input'),
    path('receipts/process/', ReceiptProcessView.as_view(), name='receipt_process'),
]

