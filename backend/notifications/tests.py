
from django.contrib.auth import get_user_model
from django.test import TestCase

from tickets.models import Ticket
from .models import Notification
from .services import (
    notify_ticket_assignment,
    notify_ticket_status_change,
)

User = get_user_model()


class TicketNotificationServiceTests(TestCase):
    def setUp(self):
        self.requester = User.objects.create_user(
            username="requester",
            password="testpass123",
        )
        self.technician = User.objects.create_user(
            username="technician",
            password="testpass123",
        )
        self.ticket = Ticket.objects.create(
            title="Laptop not connecting to Wi-Fi",
            description="The laptop cannot connect to the office network.",
            requester=self.requester,
        )

    def test_new_assignment_notifies_technician(self):
        self.ticket.assigned_to = self.technician
        self.ticket.save()

        notification = notify_ticket_assignment(
            self.ticket,
            previous_assignee=None,
        )

        self.assertIsNotNone(notification)
        self.assertEqual(notification.recipient, self.technician)
        self.assertEqual(
            notification.notification_type,
            Notification.NotificationType.TICKET_ASSIGNED,
        )
        self.assertEqual(notification.ticket, self.ticket)

    def test_unchanged_assignment_does_not_notify_again(self):
        self.ticket.assigned_to = self.technician
        self.ticket.save()

        notification = notify_ticket_assignment(
            self.ticket,
            previous_assignee=self.technician,
        )

        self.assertIsNone(notification)
        self.assertEqual(Notification.objects.count(), 0)

    def test_status_change_notifies_requester(self):
        self.ticket.status = Ticket.Status.IN_PROGRESS
        self.ticket.save()

        notification = notify_ticket_status_change(
            self.ticket,
            previous_status=Ticket.Status.OPEN,
        )

        self.assertIsNotNone(notification)
        self.assertEqual(notification.recipient, self.requester)
        self.assertEqual(
            notification.notification_type,
            Notification.NotificationType.STATUS_CHANGED,
        )

    def test_resolved_status_uses_resolved_notification_type(self):
        self.ticket.status = Ticket.Status.RESOLVED
        self.ticket.save()

        notification = notify_ticket_status_change(
            self.ticket,
            previous_status=Ticket.Status.OPEN,
        )

        self.assertIsNotNone(notification)
        self.assertEqual(
            notification.notification_type,
            Notification.NotificationType.TICKET_RESOLVED,
        )
        self.assertEqual(notification.recipient, self.requester)

    def test_unchanged_status_does_not_create_notification(self):
        notification = notify_ticket_status_change(
            self.ticket,
            previous_status=Ticket.Status.OPEN,
        )

        self.assertIsNone(notification)
        self.assertEqual(Notification.objects.count(), 0)
