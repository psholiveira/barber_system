from rest_framework import serializers
from django.utils import timezone
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    barber_username = serializers.CharField(source="barber.username", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "barber", "barber_username",
            "customer", "customer_name",
            "service", "service_name",
            "start_at", "end_at",
            "status", "notes",
            "created_by", "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]

    def validate(self, attrs):
        start_at = attrs.get("start_at")
        end_at = attrs.get("end_at")
        if start_at and end_at and end_at <= start_at:
            raise serializers.ValidationError("end_at precisa ser maior que start_at.")
        if start_at and start_at > timezone.now() + timezone.timedelta(days=365):
            raise serializers.ValidationError("Agendamento muito no futuro.")
        return attrs
