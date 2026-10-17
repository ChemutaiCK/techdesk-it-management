
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
