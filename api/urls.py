from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, UserProfileView, LogoutView,
    AccountViewSet, CategoryViewSet, TransactionViewSet, BudgetViewSet,
    ChatView, SmartReceiptProcessingView, VoiceTransactionView,
    AnomalyDetectionView, ForecastingView, BudgetSuggestionsView,
    FinancialInsightsView, DuplicateReceiptView, SmartCategorizationView,
    BatchReceiptProcessingView
)

app_name = 'api'

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'budgets', BudgetViewSet)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
    path('chat/', ChatView.as_view(), name='chat'),

    # AI-powered endpoints
    path('receipts/smart-process/', SmartReceiptProcessingView.as_view(), name='smart_receipt_process'),
    path('transactions/voice/', VoiceTransactionView.as_view(), name='voice_transaction'),
    path('analytics/anomalies/', AnomalyDetectionView.as_view(), name='anomaly_detection'),
    path('analytics/forecast/', ForecastingView.as_view(), name='forecasting'),
    path('analytics/budget-suggestions/', BudgetSuggestionsView.as_view(), name='budget_suggestions'),
    path('analytics/insights/', FinancialInsightsView.as_view(), name='financial_insights'),
    path('receipts/check-duplicate/', DuplicateReceiptView.as_view(), name='duplicate_receipt_check'),
    path('transactions/categorize/', SmartCategorizationView.as_view(), name='smart_categorization'),
    path('receipts/batch-process/', BatchReceiptProcessingView.as_view(), name='batch_receipt_process'),
]
