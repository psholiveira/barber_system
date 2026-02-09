from decimal import Decimal
from django.db import transaction
from .models import CommissionRule, Commission

def compute_commission_amount(barber, service, price_charged: Decimal) -> Decimal:
    rule = CommissionRule.objects.filter(barber=barber, service=service, active=True).first()
    if rule:
        if rule.fixed_amount is not None:
            return rule.fixed_amount
        if rule.percent is not None:
            return (price_charged * rule.percent) / Decimal("100")

    # fallback: comissão padrão do serviço
    percent = service.default_commission_percent
    return (price_charged * percent) / Decimal("100")


@transaction.atomic
def create_or_update_commission(service_record):
    amount = compute_commission_amount(
        barber=service_record.barber,
        service=service_record.service,
        price_charged=service_record.price_charged,
    )
    Commission.objects.update_or_create(
        service_record=service_record,
        defaults={
            "barber": service_record.barber,
            "base_amount": service_record.price_charged,
            "commission_amount": amount,
        },
    )
