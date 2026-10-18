
from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        TICKET_ASSIGNED = "TICKET_ASSIGNED", "Ticket Assigned"
        STATUS_CHANGED = "STATUS_CHANGED", "Status Changed"
        NEW_COMMENT = "NEW_COMMENT", "New Comment"
        TICKET_RESOLVED = "TICKET_RESOLVED", "Ticket Resolved"
        GENERAL = "GENERAL", "General"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL,
    )

    title = models.CharField(max_length=150)
    message = models.TextField()

    is_read = models.BooleanField(default=False)

    ticket = models.ForeignKey(
        "tickets.Ticket",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.recipient}"