
from django.contrib.auth import get_user_model
from django.test import TestCase

from notifications.models import Notification

from .models import Ticket
from .services import update_ticket

User = get_user_model()


class TicketWorkflowTests(TestCase):
    def setUp(self):
        self.requester = User.objects.create_user(
            username="requester",
            password="testpass123",
        )
        self.technician = User.objects.create_user(
            username="technician",
            password="testpass123",
        )
        self.other_technician = User.objects.create_user(
            username="technician2",
            password="testpass123",
        )
        self.ticket = Ticket.objects.create(
            title="Wi-Fi connection issue",
            description="Unable to connect to the office Wi-Fi.",
            requester=self.requester,
        )

    def test_assignment_change_creates_notification(self):
        update_ticket(
            self.ticket.pk,
            changes={"assigned_to": self.technician},
        )

        notification = Notification.objects.get()

        self.assertEqual(notification.recipient, self.technician)
        self.assertEqual(
            notification.notification_type,
            Notification.NotificationType.TICKET_ASSIGNED,
        )

    def test_status_change_notifies_requester(self):
        update_ticket(
            self.ticket.pk,
            changes={"status": Ticket.Status.IN_PROGRESS},
        )

        notification = Notification.objects.get()

        self.assertEqual(notification.recipient, self.requester)
        self.assertEqual(
            notification.notification_type,
            Notification.NotificationType.STATUS_CHANGED,
        )

    def test_resolving_ticket_creates_resolved_notification(self):
        update_ticket(
            self.ticket.pk,
            changes={"status": Ticket.Status.RESOLVED},
        )

        notification = Notification.objects.get()

        self.assertEqual(
            notification.notification_type,
            Notification.NotificationType.TICKET_RESOLVED,
        )

    def test_title_update_does_not_create_notification(self):
        update_ticket(
            self.ticket.pk,
            changes={"title": "Updated Wi-Fi issue"},
        )

        self.assertEqual(Notification.objects.count(), 0)

    def test_reassigning_ticket_notifies_new_technician(self):
        self.ticket.assigned_to = self.technician
        self.ticket.save()

        update_ticket(
            self.ticket.pk,
            changes={"assigned_to": self.other_technician},
        )

        self.assertEqual(Notification.objects.count(), 1)
        notification = Notification.objects.get()
        self.assertEqual(
            notification.recipient,
            self.other_technician,
        )

    def test_invalid_field_is_rejected(self):
        with self.assertRaises(ValueError):
            update_ticket(
                self.ticket.pk,
                changes={"requester": self.technician},
            )

        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.requester, self.requester)
        self.assertEqual(Notification.objects.count(), 0)
