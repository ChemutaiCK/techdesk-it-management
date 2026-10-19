
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Ticket

User = get_user_model()


class TicketSerializer(serializers.ModelSerializer):
    requester_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "ticket_number",
            "title",
            "description",
            "category",
            "priority",
            "status",
            "requester",
            "requester_name",
            "assigned_to",
            "assigned_to_name",
            "resolution_notes",
            "created_at",
            "updated_at",
            "resolved_at",
            "closed_at",
        ]
        read_only_fields = [
            "id",
            "ticket_number",
            "requester",
            "requester_name",
            "assigned_to_name",
            "created_at",
            "updated_at",
            "resolved_at",
            "closed_at",
        ]

    def get_requester_name(self, obj):
        return obj.requester.get_full_name() or obj.requester.username

    def get_assigned_to_name(self, obj):
        if obj.assigned_to is None:
            return None

        return (
            obj.assigned_to.get_full_name()
            or obj.assigned_to.username
        )

    def validate_assigned_to(self, user):
        if not user.is_active:
            raise serializers.ValidationError(
                "Tickets cannot be assigned to inactive users."
            )

        return user
