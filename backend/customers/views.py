from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from core.permissions import IsManagerOrAdmin
from .models import Customer
from .serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]  # barbeiro pode ver/cadastrar cliente no MVP
    filter_backends = [DjangoFilterBackend]
    filterset_fields = []
    search_fields = ["name", "phone", "email"]
    ordering_fields = ["name", "created_at"]
