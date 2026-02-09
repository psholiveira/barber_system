from django.conf import settings
from django.db import models

class Profile(models.Model):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        MANAGER = "MANAGER", "Gerente"
        BARBER = "BARBER", "Barbeiro"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.BARBER)

    def __str__(self):
        return f"{self.user.username} ({self.role})"
