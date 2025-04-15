from django.core.exceptions import ValidationError
from .models import ProjectMembership


class ProjectService:
    """
    Service for operations with projects
    """

    @staticmethod
    def get_tasks_for_project(project):
        return project.tasks.all()


class ProjectMembershipService:
    @staticmethod
    def assign_role(project, user, role):
        """
        Assigns a role to a user in the project. If the user already has another role, it updates it.
        Throws a ValidationError if the rules are violated.
        """
        if user == project.owner:
            raise ValidationError("Cannot assign role to the project owner")

        existing_membership = ProjectMembership.objects.filter(
            user=user, project=project
        ).first()
        if existing_membership:
            if existing_membership.role == role:
                raise ValidationError(
                    "User already has this role in the project"
                )

            existing_membership.role = role
            existing_membership.save()
            return existing_membership, False
        else:
            membership = ProjectMembership.objects.create(
                user=user, project=project, role=role
            )
            return membership, True
