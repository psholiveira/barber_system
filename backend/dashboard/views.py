from django.utils import timezone
from django.db.models import Sum
from django.db.models.functions import TruncDate, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import ServiceRecord
from core.permissions import get_role

class RevenueSummaryView(APIView):
    """
    Retorna:
    - faturamento do dia (hoje)
    - faturamento do mês atual
    - série diária do mês (para gráfico)
    - ranking barbeiros (mês)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.localtime(timezone.now())
        start_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        role = get_role(request.user)

        qs = ServiceRecord.objects.all()

        # barbeiro só vê dele mesmo; gerente/admin vê tudo
        if role not in ("MANAGER", "ADMIN"):
            qs = qs.filter(barber=request.user)

        day_total = qs.filter(performed_at__gte=start_day, performed_at__lte=now).aggregate(
            total=Sum("price_charged")
        )["total"] or 0

        month_total = qs.filter(performed_at__gte=start_month, performed_at__lte=now).aggregate(
            total=Sum("price_charged")
        )["total"] or 0

        # série diária do mês
        daily_series = (
            qs.filter(performed_at__gte=start_month, performed_at__lte=now)
            .annotate(day=TruncDate("performed_at"))
            .values("day")
            .annotate(total=Sum("price_charged"))
            .order_by("day")
        )

        # ranking barbeiros (mês) - somente gerente/admin
        barber_ranking = []
        if role in ("MANAGER", "ADMIN"):
            barber_ranking = (
                ServiceRecord.objects.filter(performed_at__gte=start_month, performed_at__lte=now)
                .values("barber__id", "barber__username")
                .annotate(total=Sum("price_charged"))
                .order_by("-total")
            )

        return Response({
            "timezone": str(timezone.get_current_timezone()),
            "today_total": day_total,
            "month_total": month_total,
            "daily_series": list(daily_series),
            "barber_ranking": list(barber_ranking),
        })


class RevenueByMonthView(APIView):
    """
    Retorna últimos N meses agregados para gráfico.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = get_role(request.user)
        qs = ServiceRecord.objects.all()
        if role not in ("MANAGER", "ADMIN"):
            qs = qs.filter(barber=request.user)

        data = (
            qs.annotate(month=TruncMonth("performed_at"))
            .values("month")
            .annotate(total=Sum("price_charged"))
            .order_by("month")
        )
        return Response({"series": list(data)})

from core.models import ServiceRecord
from finance.models import Payment, PaymentMethod, Commission
from scheduling.models import Appointment

class OpsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.localtime(timezone.now())
        start_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        role = get_role(request.user)

        records = ServiceRecord.objects.all()
        appts = Appointment.objects.select_related("customer", "service", "barber").all()
        payments = Payment.objects.all()
        commissions = Commission.objects.all()

        if role not in ("MANAGER", "ADMIN"):
            records = records.filter(barber=request.user)
            appts = appts.filter(barber=request.user)
            payments = payments.filter(service_record__barber=request.user)
            commissions = commissions.filter(barber=request.user)

        # agenda do dia
        todays_appts = appts.filter(start_at__gte=start_day, start_at__lte=now.replace(hour=23, minute=59, second=59))

        # faturamento mês
        month_total = records.filter(performed_at__gte=start_month, performed_at__lte=now).aggregate(
            total=Sum("price_charged")
        )["total"] or 0

        # pagamentos por método
        by_method = (
            payments.filter(created_at__gte=start_month, created_at__lte=now)
            .values("method")
            .annotate(total=Sum("amount"))
            .order_by("method")
        )

        # total comissões no mês
        comm_total = commissions.filter(created_at__gte=start_month, created_at__lte=now).aggregate(
            total=Sum("commission_amount")
        )["total"] or 0

        return Response({
            "month_total": month_total,
            "payments_by_method": list(by_method),
            "month_commissions_total": comm_total,
            "todays_appointments": [
                {
                    "id": a.id,
                    "start_at": a.start_at,
                    "end_at": a.end_at,
                    "status": a.status,
                    "customer": a.customer.name,
                    "service": a.service.name,
                    "barber": a.barber.username,
                }
                for a in todays_appts.order_by("start_at")[:100]
            ],
        })
