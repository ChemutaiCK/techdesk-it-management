
from django.contrib.auth import get_user_model
from django.test import TestCase

from notifications.models import Notification

from .models import Ticket
from .services import update_ticket

from django.contrib.auth.models import Group
from notifications.models import Notification

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


from rest_framework.test import APITestCase
from rest_framework import status


class TicketAPITests(APITestCase):

 def setUp(self):
    self.employee_group, _ = Group.objects.get_or_create(
        name="Employee"
    )
    self.technician_group, _ = Group.objects.get_or_create(
        name="IT Technician"
    )
    self.admin_group, _ = Group.objects.get_or_create(
        name="Administrator"
    )

    self.employee = User.objects.create_user(
        username="api_employee",
        password="TestPass123!",
    )
    self.other_employee = User.objects.create_user(
        username="api_employee2",
        password="TestPass123!",
    )
    self.technician = User.objects.create_user(
        username="api_technician",
        password="TestPass123!",
    )

    self.employee.groups.add(self.employee_group)
    self.other_employee.groups.add(self.employee_group)
    self.technician.groups.add(self.technician_group)

    self.ticket = Ticket.objects.create(
        title="Laptop issue",
        description="Laptop will not start.",
        requester=self.employee,
    )

    self.list_url = "/api/tickets/"

    def test_ticket_list_requires_authentication(self):
        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_employee_can_create_ticket(self):
        self.client.force_authenticate(user=self.employee)

        response = self.client.post(
            self.list_url,
            {
                "title": "Email issue",
                "description": "Cannot access work email.",
                "category": Ticket.Category.EMAIL,
                "priority": Ticket.Priority.MEDIUM,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            Ticket.objects.get(title="Email issue").requester,
            self.employee,
        )

    def test_employee_only_sees_own_tickets(self):
        Ticket.objects.create(
            title="Private issue",
            description="Another employee's issue.",
            requester=self.other_employee,
        )

        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        returned_titles = [
            item["title"] for item in response.data
        ]
        self.assertIn("Laptop issue", returned_titles)
        self.assertNotIn("Private issue", returned_titles)

    def test_employee_cannot_change_ticket_status(self):
        self.client.force_authenticate(user=self.employee)

        response = self.client.patch(
            f"{self.list_url}{self.ticket.pk}/",
            {"status": Ticket.Status.RESOLVED},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.OPEN)

    def test_technician_can_update_assigned_ticket(self):
        self.ticket.assigned_to = self.technician
        self.ticket.save()

        self.client.force_authenticate(user=self.technician)

        response = self.client.patch(
            f"{self.list_url}{self.ticket.pk}/",
            {"status": Ticket.Status.IN_PROGRESS},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.ticket.refresh_from_db()
        self.assertEqual(
            self.ticket.status,
            Ticket.Status.IN_PROGRESS,
        )

        self.assertTrue(
            Notification.objects.filter(
                recipient=self.employee,
                notification_type=Notification.NotificationType.STATUS_CHANGED,
                ticket=self.ticket,
            ).exists()
        )
