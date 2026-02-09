from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decimal import Decimal

from accounts.models import Profile
from core.models import Service

User = get_user_model()

DEFAULT_SERVICES = [
    ("Corte", Decimal("35.00"), Decimal("50.00")),
    ("Barba", Decimal("30.00"), Decimal("50.00")),
    ("Corte + Barba", Decimal("60.00"), Decimal("50.00")),
    ("Sobrancelha", Decimal("15.00"), Decimal("50.00")),
]

class Command(BaseCommand):
    help = "Cria dados iniciais: serviços e usuários padrão."

    def add_arguments(self, parser):
        parser.add_argument("--admin-user", default="admin")
        parser.add_argument("--admin-pass", default="Admin@123456789")
        parser.add_argument("--manager-user", default="gerente")
        parser.add_argument("--manager-pass", default="Gerente@123456789")

    def handle(self, *args, **opts):
        # Serviços
        for name, price, comm in DEFAULT_SERVICES:
            obj, created = Service.objects.update_or_create(
                name=name,
                defaults={
                    "default_price": price,
                    "default_commission_percent": comm,
                    "active": True,
                },
            )
        self.stdout.write(self.style.SUCCESS("Serviços criados/atualizados."))

        # Admin
        admin_user = opts["admin_user"]
        admin_pass = opts["admin_pass"]

        admin, created = User.objects.get_or_create(username=admin_user, defaults={"is_staff": True, "is_superuser": True})
        if created:
            admin.set_password(admin_pass)
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()
        admin.profile.role = Profile.Role.ADMIN
        admin.profile.save()
        self.stdout.write(self.style.SUCCESS(f"Admin pronto: {admin_user} / {admin_pass}"))

        # Manager
        mgr_user = opts["manager_user"]
        mgr_pass = opts["manager_pass"]
        mgr, created = User.objects.get_or_create(username=mgr_user)
        if created:
            mgr.set_password(mgr_pass)
            mgr.save()
        mgr.profile.role = Profile.Role.MANAGER
        mgr.profile.save()
        self.stdout.write(self.style.SUCCESS(f"Gerente pronto: {mgr_user} / {mgr_pass}"))

        self.stdout.write(self.style.SUCCESS("Seed finalizado."))
