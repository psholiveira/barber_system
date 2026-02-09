from django.contrib import admin
from .models import Service, ServiceRecord

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "default_price", "active")
    list_filter = ("active",)
    search_fields = ("name",)

@admin.register(ServiceRecord)
class ServiceRecordAdmin(admin.ModelAdmin):
    list_display = ("performed_at", "service", "barber", "price_charged")
    list_filter = ("service", "barber")
    search_fields = ("barber__username", "service__name")
