from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from core.permissions import IsManagerOrAdmin, get_role
from .models import CashSession, CashEntry, Payment, CommissionRule, Commission
from .serializers import (
    CashSessionSerializer, CashEntrySerializer, PaymentSerializer,
    CommissionRuleSerializer, CommissionSerializer
)


class OpenCashSummaryView(APIView):
    """
    Retorna resumo do caixa ABERTO:
    - inicial
    - total pagamentos vinculados ao caixa
    - total entradas/saídas
    - esperado (inicial + pagamentos + entradas - saídas)
    """
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]

    def get(self, request):
        cash = CashSession.objects.filter(closed_at__isnull=True).order_by("-opened_at").first()
        if not cash:
            return Response({"open": False})

        payments_total = Payment.objects.filter(cash_session=cash).aggregate(
            total=Sum("amount")
        )["total"] or 0

        entries_in = CashEntry.objects.filter(cash_session=cash, type="IN").aggregate(
            total=Sum("amount")
        )["total"] or 0

        entries_out = CashEntry.objects.filter(cash_session=cash, type="OUT").aggregate(
            total=Sum("amount")
        )["total"] or 0

        expected = cash.initial_amount + payments_total + entries_in - entries_out

        return Response({
            "open": True,
            "cash_session_id": cash.id,
            "opened_at": cash.opened_at,
            "initial_amount": cash.initial_amount,
            "payments_total": payments_total,
            "entries_in": entries_in,
            "entries_out": entries_out,
            "expected_amount": expected,
        })


class CashSessionViewSet(viewsets.ModelViewSet):
    queryset = CashSession.objects.all().order_by("-opened_at")
    serializer_class = CashSessionSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]

    def perform_create(self, serializer):
        serializer.save(opened_by=self.request.user)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        session = self.get_object()
        closing_amount = request.data.get("closing_amount")

        if not session.is_open():
            return Response({"detail": "Caixa já está fechado."}, status=400)

        if closing_amount is None:
            return Response({"detail": "closing_amount é obrigatório."}, status=400)

        session.close(user=request.user, closing_amount=closing_amount)
        return Response(CashSessionSerializer(session).data)


class CashEntryViewSet(viewsets.ModelViewSet):
    queryset = CashEntry.objects.select_related("cash_session").all()
    serializer_class = CashEntrySerializer
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]

    def perform_create(self, serializer):
        # Somente manager/admin já está garantido pela permissão
        serializer.save(created_by=self.request.user)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Pagamentos são criados via registro de serviço (ServiceRecord).
    Aqui é somente auditoria.
    """
    queryset = Payment.objects.select_related("service_record", "cash_session").all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]


class CommissionRuleViewSet(viewsets.ModelViewSet):
    queryset = CommissionRule.objects.select_related("barber", "service").all()
    serializer_class = CommissionRuleSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]


class CommissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Commission.objects.select_related("barber", "service_record").all().order_by("-created_at")
    serializer_class = CommissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        role = get_role(self.request.user)
        if role in ("MANAGER", "ADMIN"):
            return qs
        return qs.filter(barber=self.request.user)
