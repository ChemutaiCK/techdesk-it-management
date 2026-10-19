
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone

from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Ticket
from .serializers import TicketSerializer
from .services import update_ticket

User = get_user_model()


def user_has_role(user, role):
    return user.groups.filter(name=role).exists()


class TicketAccessPermission(permissions.BasePermission):
    """
    Administrators can access all tickets.
    Employees can access their own tickets.
    Technicians can access tickets assigned to them.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user_has_role(user, "Administrator") or user.is_superuser:
            return True

        if user_has_role(user, "Employee") and obj.requester_id == user.id:
            return True

        if (
            user_has_role(user, "IT Technician")
            and obj.assigned_to_id == user.id
        ):
            return True

        return False


class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or user_has_role(user, "Administrator"):
            return Ticket.objects.select_related(
                "requester", "assigned_to"
            ).all()

        visible_tickets = Q(requester=user)

        if user_has_role(user, "IT Technician"):
            visible_tickets |= Q(assigned_to=user)

        return (
            Ticket.objects.select_related("requester", "assigned_to")
            .filter(visible_tickets)
            .distinct()
        )

    def perform_create(self, serializer):
        user = self.request.user

        if not (
            user.is_superuser
            or user_has_role(user, "Administrator")
            or user_has_role(user, "Employee")
        ):
            raise PermissionDenied(
                "Your role is not permitted to create tickets."
            )

        serializer.save(requester=user)


class TicketDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        TicketAccessPermission,
    ]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return Ticket.objects.select_related(
            "requester", "assigned_to"
        )

    def partial_update(self, request, *args, **kwargs):
        ticket = self.get_object()
        user = request.user
        data = request.data.copy()

        is_admin = user.is_superuser or user_has_role(
            user, "Administrator"
        )
        is_technician = user_has_role(user, "IT Technician")

        restricted_for_non_admin = {
            "assigned_to",
            "status",
            "priority",
            "category",
            "resolution_notes",
        }

        if not is_admin and restricted_for_non_admin.intersection(data.keys()):
            if not is_technician:
                raise PermissionDenied(
                    "Only IT technicians and administrators can update "
                    "assignment, status, priority, category, or resolution."
                )

            if "assigned_to" in data:
                raise PermissionDenied(
                    "Only administrators can change ticket assignments."
                )

        if "assigned_to" in data:
            assigned_to_id = data.pop("assigned_to")

            if not is_admin:
                raise PermissionDenied(
                    "Only administrators can change ticket assignments."
                )

            try:
                data["assigned_to"] = User.objects.get(
                    pk=assigned_to_id,
                    is_active=True,
                )
            except (User.DoesNotExist, ValueError, TypeError):
                raise PermissionDenied(
                    "The selected assignee is invalid or inactive."
                )

        if "status" in data:
            if not (is_admin or is_technician):
                raise PermissionDenied(
                    "Only IT technicians and administrators can change "
                    "ticket status."
                )

        changes = {}

        allowed_fields = {
            "title",
            "description",
            "category",
            "priority",
            "status",
            "assigned_to",
            "resolution_notes",
        }

        unknown_fields = set(data.keys()) - allowed_fields
        if unknown_fields:
            from rest_framework.exceptions import ValidationError

            raise ValidationError({
                field: "This field cannot be updated."
                for field in sorted(unknown_fields)
            })

        for field, value in data.items():
            if field == "assigned_to":
                changes[field] = value
            elif field in allowed_fields:
                changes[field] = value

        updated_ticket = update_ticket(ticket.pk, changes=changes)

        if updated_ticket.status == Ticket.Status.RESOLVED:
            if updated_ticket.resolved_at is None:
                updated_ticket.resolved_at = timezone.now()
                updated_ticket.save(update_fields=["resolved_at"])

        if updated_ticket.status == Ticket.Status.CLOSED:
            if updated_ticket.closed_at is None:
                updated_ticket.closed_at = timezone.now()
                updated_ticket.save(update_fields=["closed_at"])

        serializer = self.get_serializer(updated_ticket)
        return Response(serializer.data)
