from django.conf import settings
from django.db import models
from django.utils import timezone
from core.models import ServiceRecord, Service

class PaymentMethod(models.TextChoices):
    CASH = "CASH", "Dinheiro"
    PIX = "PIX", "PIX"
    CARD = "CARD", "Cartão"

class CashSession(models.Model):
    opened_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="cash_sessions_opened")
    opened_at = models.DateTimeField(auto_now_add=True)
    initial_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    closed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, blank=True, related_name="cash_sessions_closed")
    closed_at = models.DateTimeField(null=True, blank=True)
    closing_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def is_open(self):
        return self.closed_at is None

    def close(self, user, closing_amount):
        self.closed_by = user
        self.closed_at = timezone.now()
        self.closing_amount = closing_amount
        self.save()

    def __str__(self):
        return f"Caixa {self.opened_at:%Y-%m-%d} ({'ABERTO' if self.is_open() else 'FECHADO'})"

class CashEntry(models.Model):
    class Type(models.TextChoices):
        IN = "IN", "Entrada"
        OUT = "OUT", "Saída"

    cash_session = models.ForeignKey(CashSession, on_delete=models.PROTECT, related_name="entries")
    type = models.CharField(max_length=10, choices=Type.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

class Payment(models.Model):
    service_record = models.OneToOneField(ServiceRecord, on_delete=models.CASCADE, related_name="payment")
    method = models.CharField(max_length=10, choices=PaymentMethod.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    cash_session = models.ForeignKey(CashSession, on_delete=models.PROTECT, null=True, blank=True, related_name="payments")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

class CommissionRule(models.Model):
    """
    Regra por barbeiro + serviço. Se não existir, usa Service.default_commission_percent
    """
    barber = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="commission_rules")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="commission_rules")

    percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # 0-100
    fixed_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("barber", "service")

class Commission(models.Model):
    service_record = models.OneToOneField(ServiceRecord, on_delete=models.CASCADE, related_name="commission")
    barber = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="commissions")

    base_amount = models.DecimalField(max_digits=10, decimal_places=2)  # preço do serviço
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
