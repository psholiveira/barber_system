from django.utils import timezone
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response


from .models import Service, ServiceRecord
from .serializers import (
    ServiceSerializer,
    ServiceRecordSerializer,
    ServiceRecordCreateSerializer,
)
from .permissions import IsManagerOrAdmin, IsOwnerOrManagerAdmin, get_role
from .services import register_service_sale


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["active"]
    search_fields = ["name"]
    ordering_fields = ["name", "default_price"]


class ServiceRecordViewSet(viewsets.ModelViewSet):
    queryset = ServiceRecord.objects.select_related("service", "barber", "customer").all()
    permission_classes = [IsAuthenticated, IsOwnerOrManagerAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["barber", "service", "customer"]
    search_fields = ["service__name", "barber__username", "notes", "customer__name"]
    ordering_fields = ["performed_at", "price_charged", "created_at"]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ServiceRecordCreateSerializer
        return ServiceRecordSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        role = get_role(self.request.user)
        if role in ("MANAGER", "ADMIN"):
            return qs
        return qs.filter(barber=self.request.user)

    def perform_create(self, serializer):
        role = get_role(self.request.user)

        # barbeiro não pode registrar para outro barbeiro
        if role not in ("MANAGER", "ADMIN"):
            record = serializer.save(barber=self.request.user)
        else:
            record = serializer.save()

        payment_method = serializer.validated_data["payment_method"]
        payment_amount = serializer.validated_data["payment_amount"]

        # cria Payment + Commission em transação e exige caixa aberto
        from rest_framework.exceptions import ValidationError
        try:
            register_service_sale(
                service_record=record,
                payment_method=payment_method,
                payment_amount=payment_amount,
                created_by=self.request.user,
            )
        except ValueError as e:
            raise ValidationError({"detail": str(e)})

class TodayRecordsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start = timezone.localtime(timezone.now()).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        qs = ServiceRecord.objects.filter(performed_at__gte=start)

        # barbeiro vê só os próprios
        if get_role(request.user) == "BARBER":
            qs = qs.filter(barber=request.user)

        total = qs.aggregate(total=Sum("price_charged"))["total"] or 0

        return Response({
            "total": total,
            "count": qs.count(),
        })        
