from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("start_at", "end_at", "customer", "service", "barber", "status")
    list_filter = ("status", "barber")
    search_fields = ("customer__name", "barber__username", "service__name")
