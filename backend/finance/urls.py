from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CashSessionViewSet,
    CashEntryViewSet,
    PaymentViewSet,
    CommissionRuleViewSet,
    CommissionViewSet,
    OpenCashSummaryView,
)

router = DefaultRouter()
router.register(r"cash-sessions", CashSessionViewSet, basename="cash-sessions")
router.register(r"cash-entries", CashEntryViewSet, basename="cash-entries")
router.register(r"payments", PaymentViewSet, basename="payments")
router.register(r"commission-rules", CommissionRuleViewSet, basename="commission-rules")
router.register(r"commissions", CommissionViewSet, basename="commissions")

urlpatterns = [
    # Caixa aberto + resumo (MVP)
    path("cash/open-summary/", OpenCashSummaryView.as_view(), name="cash-open-summary"),
]

urlpatterns += router.urls
