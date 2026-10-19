
from django.conf import settings
from django.db import models


class Asset(models.Model):
    class Category(models.TextChoices):
        LAPTOP = "LAPTOP", "Laptop"
        DESKTOP = "DESKTOP", "Desktop Computer"
        MONITOR = "MONITOR", "Monitor"
        PRINTER = "PRINTER", "Printer"
        NETWORK = "NETWORK", "Network Equipment"
        MOBILE = "MOBILE", "Mobile Device"
        ACCESSORY = "ACCESSORY", "Accessory"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        ASSIGNED = "ASSIGNED", "Assigned"
        UNDER_MAINTENANCE = "UNDER_MAINTENANCE", "Under Maintenance"
        RETIRED = "RETIRED", "Retired"

    asset_tag = models.CharField(
        max_length=50,
        unique=True,
    )

    name = models.CharField(max_length=150)

    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )

    manufacturer = models.CharField(
        max_length=100,
        blank=True,
    )

    model_number = models.CharField(
        max_length=100,
        blank=True,
    )

    serial_number = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_assets",
    )

    department = models.CharField(
        max_length=100,
        blank=True,
    )

    location = models.CharField(
        max_length=150,
        blank=True,
    )

    purchase_date = models.DateField(
        null=True,
        blank=True,
    )

    warranty_expiry = models.DateField(
        null=True,
        blank=True,
    )

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["asset_tag"]

    def __str__(self):
        return f"{self.asset_tag} - {self.name}"


class MaintenanceRecord(models.Model):
    class MaintenanceType(models.TextChoices):
        ROUTINE = "ROUTINE", "Routine Service"
        REPAIR = "REPAIR", "Repair"
        INSPECTION = "INSPECTION", "Inspection"
        UPGRADE = "UPGRADE", "Upgrade"

    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    asset = models.ForeignKey(
        Asset,
        on_delete=models.PROTECT,
        related_name="maintenance_records",
    )

    maintenance_type = models.CharField(
        max_length=20,
        choices=MaintenanceType.choices,
        default=MaintenanceType.ROUTINE,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
    )

    description = models.TextField()

    outcome = models.TextField(blank=True)

    technician = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="maintenance_records",
    )

    scheduled_date = models.DateField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    next_service_date = models.DateField(null=True, blank=True)

    cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Maintenance Record"
        verbose_name_plural = "Maintenance Records"

    def __str__(self):
        return (
            f"{self.asset.asset_tag} - "
            f"{self.get_maintenance_type_display()}"
        )
