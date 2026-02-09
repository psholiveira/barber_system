from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ServiceViewSet,
    ServiceRecordViewSet,
    TodayRecordsView,
)

router = DefaultRouter()
router.register(r"services", ServiceViewSet, basename="services")
router.register(r"service-records", ServiceRecordViewSet, basename="service-records")

urlpatterns = [
    # endpoints extras (não REST padrão)
    path("records/today/", TodayRecordsView.as_view(), name="records-today"),
]

urlpatterns += router.urls
