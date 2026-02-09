from django.conf import settings
from django.db import models


class Appointment(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Agendado"
        CONFIRMED = "CONFIRMED", "Confirmado"
        DONE = "DONE", "Atendido"
        NO_SHOW = "NO_SHOW", "Faltou"
        CANCELED = "CANCELED", "Cancelado"

    barber = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="appointments")
    customer = models.ForeignKey("customers.Customer", on_delete=models.PROTECT, related_name="appointments")
    service = models.ForeignKey("core.Service", on_delete=models.PROTECT, related_name="appointments")

    start_at = models.DateTimeField()
    end_at = models.DateTimeField()

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    notes = models.CharField(max_length=255, blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="appointments_created")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["barber", "start_at"]),
            models.Index(fields=["start_at"]),
            models.Index(fields=["status"]),
        ]
        ordering = ["-start_at"]

    def __str__(self):
        return f"{self.customer.name} - {self.start_at:%Y-%m-%d %H:%M}"
