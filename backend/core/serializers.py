from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal

from .models import Service, ServiceRecord
from customers.models import Customer  # se você usa Customer aqui
from finance.models import PaymentMethod  # precisa existir no finance/models.py


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "default_price", "default_commission_percent", "active"]


class ServiceRecordCreateSerializer(serializers.ModelSerializer):
    """
    Serializer de criação para registro de serviço com pagamento embutido.
    """
    payment_method = serializers.ChoiceField(choices=PaymentMethod.choices, write_only=True)
    payment_amount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)

    class Meta:
        model = ServiceRecord
        fields = [
            "id",
            "barber",
            "service",
            "customer",
            "appointment",
            "price_charged",
            "performed_at",
            "notes",
            "payment_method",
            "payment_amount",
        ]
        read_only_fields = ["id"]

    def validate_performed_at(self, value):
        if value and value > timezone.now() + timezone.timedelta(minutes=5):
            raise serializers.ValidationError("performed_at não pode estar no futuro.")
        return value

    def validate(self, attrs):
        if attrs.get("performed_at") is None:
            attrs["performed_at"] = timezone.now()

        if attrs.get("payment_amount") is None:
            attrs["payment_amount"] = attrs.get("price_charged")

        if attrs.get("payment_amount") is None:
            raise serializers.ValidationError("payment_amount ou price_charged é obrigatório.")

        if Decimal(str(attrs["payment_amount"])) <= Decimal("0"):
            raise serializers.ValidationError("payment_amount deve ser > 0.")

        if Decimal(str(attrs["price_charged"])) <= Decimal("0"):
            raise serializers.ValidationError("price_charged deve ser > 0.")

        return attrs


class ServiceRecordSerializer(serializers.ModelSerializer):
    barber_username = serializers.CharField(source="barber.username", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)

    payment_method = serializers.CharField(source="payment.method", read_only=True)
    payment_amount = serializers.DecimalField(source="payment.amount", max_digits=10, decimal_places=2, read_only=True)
    commission_amount = serializers.DecimalField(source="commission.commission_amount", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ServiceRecord
        fields = [
            "id",
            "barber",
            "barber_username",
            "service",
            "service_name",
            "customer",
            "customer_name",
            "appointment",
            "price_charged",
            "performed_at",
            "notes",
            "created_at",
            "payment_method",
            "payment_amount",
            "commission_amount",
        ]
        read_only_fields = ["id", "created_at", "payment_method", "payment_amount", "commission_amount"]
