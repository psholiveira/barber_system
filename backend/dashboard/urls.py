from django.urls import path
from .views import RevenueSummaryView, RevenueByMonthView, OpsSummaryView

urlpatterns = [
    path("revenue/summary/", RevenueSummaryView.as_view()),
    path("revenue/by-month/", RevenueByMonthView.as_view()),
    path("ops/summary/", OpsSummaryView.as_view()),
]
