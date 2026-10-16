
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group


class Command(BaseCommand):
    help = "Create the default TechDesk user role groups."

    def handle(self, *args, **options):
        roles = [
            "Employee",
            "IT Technician",
            "Administrator",
        ]

        for role_name in roles:
            group, created = Group.objects.get_or_create(
                name=role_name
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created role: {role_name}"
                    )
                )
            else:
                self.stdout.write(
                    f"Role already exists: {role_name}"
                )

        self.stdout.write(
            self.style.SUCCESS("TechDesk roles are ready.")
        )
