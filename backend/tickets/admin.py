
from django.contrib import admin
from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        "ticket_number",
        "title",
        "category",
        "priority",
        "status",
        "requester",
        "assigned_to",
        "created_at",
    )

    list_filter = (
        "status",
        "priority",
        "category",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "requester__username",
        "assigned_to__username",
    )

    readonly_fields = (
        "ticket_number",
        "created_at",
        "updated_at",
    )

    list_select_related = ("requester", "assigned_to")
    date_hierarchy = "created_at"


from .models import TicketComment


@admin.register(TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    list_display = (
        "ticket",
        "author",
        "is_internal",
        "created_at",
    )

    list_filter = (
        "is_internal",
        "created_at",
    )

    search_fields = (
        "message",
        "author__username",
        "ticket__title",
    )

    readonly_fields = ("created_at",)
    list_select_related = ("ticket", "author")
    date_hierarchy = "created_at"
