from django.db import transaction
from decimal import Decimal

from finance.models import Payment
from finance.utils import get_open_cash_session
from finance.services import create_or_update_commission
from scheduling.models import Appointment


@transaction.atomic
def register_service_sale(*, service_record, payment_method: str, payment_amount: Decimal, created_by):
    """
    Cria Payment + Commission em transação.
    Exige caixa aberto.
    """
    cash_session = get_open_cash_session()
    if not cash_session:
        raise ValueError("Não existe caixa aberto. Abra o caixa para registrar vendas.")

    Payment.objects.create(
        service_record=service_record,
        method=payment_method,
        amount=payment_amount,
        cash_session=cash_session,
        created_by=created_by,
    )

    create_or_update_commission(service_record)

    if getattr(service_record, "appointment_id", None):
        Appointment.objects.filter(id=service_record.appointment_id).update(status=Appointment.Status.DONE)

    return service_record
