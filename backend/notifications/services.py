
from .models import Notification


def create_notification(
    *,
    recipient,
    notification_type,
    title,
    message,
    ticket=None,
):
    """Create an in-app notification for a user."""

    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        ticket=ticket,
    )


def notify_ticket_assignment(ticket, previous_assignee=None):
    """Notify the newly assigned technician when assignment changes."""

    new_assignee = ticket.assigned_to

    if new_assignee is None:
        return None

    if (
        previous_assignee is not None
        and previous_assignee.pk == new_assignee.pk
    ):
        return None

    return create_notification(
        recipient=new_assignee,
        notification_type=Notification.NotificationType.TICKET_ASSIGNED,
        title="Ticket assigned to you",
        message=(
            f'Ticket "{ticket.title}" has been assigned to you.'
        ),
        ticket=ticket,
    )


def notify_ticket_status_change(ticket, previous_status):
    """Notify the requester when a ticket status changes."""

    if previous_status == ticket.status:
        return None

    if ticket.status == ticket.Status.RESOLVED:
        notification_type = (
            Notification.NotificationType.TICKET_RESOLVED
        )
        title = "Ticket resolved"
    else:
        notification_type = (
            Notification.NotificationType.STATUS_CHANGED
        )
        title = "Ticket status updated"

    return create_notification(
        recipient=ticket.requester,
        notification_type=notification_type,
        title=title,
        message=(
            f'Ticket "{ticket.title}" status changed '
            f"from {ticket.Status(previous_status).label} "
            f"to {ticket.get_status_display()}."
        ),
        ticket=ticket,
    )
