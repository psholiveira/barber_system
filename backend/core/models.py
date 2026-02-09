from django.conf import settings
from django.db import models


class Service(models.Model):
    name = models.CharField(max_length=120, unique=True)
    default_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    default_commission_percent = models.DecimalField(max_digits=5, decimal_places=2, default=50)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class ServiceRecord(models.Model):
    barber = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="service_records")
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name="records")
    customer = models.ForeignKey("customers.Customer", on_delete=models.PROTECT, null=True, blank=True, related_name="service_records")
    appointment = models.OneToOneField("scheduling.Appointment", on_delete=models.SET_NULL, null=True, blank=True, related_name="service_record")

    price_charged = models.DecimalField(max_digits=10, decimal_places=2)
    performed_at = models.DateTimeField()
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["performed_at"]),
            models.Index(fields=["barber", "performed_at"]),
        ]
        ordering = ["-performed_at"]

    def __str__(self):
        return f"{self.service.name} - {self.barber.username} - {self.performed_at:%Y-%m-%d %H:%M}"


class PaymentMethod(models.TextChoices):
    CASH = "CASH", "Dinheiro"
    PIX = "PIX", "PIX"
    CARD = "CARD", "Cartão"
