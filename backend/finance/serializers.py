from rest_framework import serializers
from .models import CashSession, CashEntry, Payment, CommissionRule, Commission

class CashSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashSession
        fields = ["id", "opened_by", "opened_at", "initial_amount", "closed_by", "closed_at", "closing_amount"]
        read_only_fields = ["id", "opened_by", "opened_at", "closed_by", "closed_at"]

class CashEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = CashEntry
        fields = ["id", "cash_session", "type", "amount", "description", "created_by", "created_at"]
        read_only_fields = ["id", "created_by", "created_at"]

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "service_record", "method", "amount", "cash_session", "created_by", "created_at"]
        read_only_fields = ["id", "created_by", "created_at"]

class CommissionRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionRule
        fields = ["id", "barber", "service", "percent", "fixed_amount", "active"]
        read_only_fields = ["id"]

class CommissionSerializer(serializers.ModelSerializer):
    barber_username = serializers.CharField(source="barber.username", read_only=True)
    class Meta:
        model = Commission
        fields = ["id", "service_record", "barber", "barber_username", "base_amount", "commission_amount", "created_at"]
        read_only_fields = ["id", "created_at"]
