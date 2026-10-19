
from django.db import transaction

from notifications.services import (
    notify_ticket_assignment,
    notify_ticket_status_change,
)

from .models import Ticket


@transaction.atomic
def update_ticket(ticket_id, *, changes):
    """
    Update a ticket and notify users when assignment or status changes.

    Args:
        ticket_id: The database ID of the ticket to update.
        changes: A dictionary containing fields to update.

    Returns:
        The updated Ticket instance.
    """
    ticket = Ticket.objects.select_for_update().get(pk=ticket_id)

    previous_assignee_id = ticket.assigned_to_id
    previous_status = ticket.status

    allowed_fields = {
        "title",
        "description",
        "category",
        "priority",
        "status",
        "assigned_to",
        "resolution_notes",
    }

    invalid_fields = set(changes) - allowed_fields
    if invalid_fields:
        raise ValueError(
            f"Fields cannot be updated: {', '.join(sorted(invalid_fields))}"
        )

    for field, value in changes.items():
        setattr(ticket, field, value)

    ticket.save()

    if ticket.assigned_to_id != previous_assignee_id:
        previous_assignee = None

        if previous_assignee_id is not None:
            previous_assignee = (
                ticket._meta.get_field("assigned_to")
                .remote_field.model.objects.get(
                    pk=previous_assignee_id
                )
            )

        notify_ticket_assignment(
            ticket,
            previous_assignee=previous_assignee,
        )

    notify_ticket_status_change(
        ticket,
        previous_status=previous_status,
    )

    return ticket
