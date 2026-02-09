from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from core.permissions import get_role
from .models import Appointment
from .serializers import AppointmentSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("barber", "customer", "service").all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["barber", "status"]
    search_fields = ["customer__name", "barber__username", "service__name", "notes"]
    ordering_fields = ["start_at", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        role = get_role(self.request.user)
        if role in ("MANAGER", "ADMIN"):
            return qs
        # barbeiro vê só o dele
        return qs.filter(barber=self.request.user)

    def perform_create(self, serializer):
        role = get_role(self.request.user)
        if role not in ("MANAGER", "ADMIN"):
            serializer.save(created_by=self.request.user, barber=self.request.user)
        else:
            serializer.save(created_by=self.request.user)
