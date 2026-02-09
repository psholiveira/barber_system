from .models import CashSession

def get_open_cash_session():
    """
    Retorna o caixa aberto mais recente (closed_at is null).
    """
    return CashSession.objects.filter(closed_at__isnull=True).order_by("-opened_at").first()
