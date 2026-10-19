
from django.contrib import admin
from .models import Asset, MaintenanceRecord


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = (
        "asset_tag",
        "name",
        "category",
        "status",
        "assigned_to",
        "department",
        "location",
        "warranty_expiry",
    )

    list_filter = (
        "category",
        "status",
        "department",
    )

    search_fields = (
        "asset_tag",
        "name",
        "manufacturer",
        "model_number",
        "serial_number",
        "assigned_to__username",
        "department",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_select_related = ("assigned_to",)
    date_hierarchy = "created_at"


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = (
        "asset",
        "maintenance_type",
        "status",
        "technician",
        "scheduled_date",
        "completed_at",
        "cost",
    )

    list_filter = (
        "maintenance_type",
        "status",
        "scheduled_date",
    )

    search_fields = (
        "asset__asset_tag",
        "asset__name",
        "description",
        "outcome",
        "technician__username",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_select_related = ("asset", "technician")
    date_hierarchy = "created_at"
