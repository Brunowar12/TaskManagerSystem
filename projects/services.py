from datetime import timedelta
from django.core.exceptions import ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from .models import Project, ProjectMembership, ProjectShareLink, Role


class ProjectService:
    """
    Service for working with projects:
    - creating a project with automatic assignment of the Admin role
    - receiving a project with access verification
    """

    @staticmethod
    @transaction.atomic
    def create_project(owner, **data):
        """Creates a new project and adds an owner with the Admin role"""
        project = Project.objects.create(owner=owner, **data)
        admin_role = Role.objects.get(name="Admin")

        ProjectMembership.objects.get_or_create(
            user=owner, project=project, defaults={"role": admin_role}
        )
        return project

    @staticmethod
    def get_project_or_404(pk, user):
        """
        Returns the project by pk if the user is the owner
        or member; otherwise calls PermissionDenied
        """
        project = get_object_or_404(
            Project.objects.prefetch_related("memberships__role"), pk=pk
        )

        is_member = project.memberships.filter(user=user).exists()
        if project.owner != user and not is_member:
            raise PermissionError("You do not have acces to this project")

        return project


class ProjectShareLinkService:
    """
    Service for validation and creation of links to join the project
    """

    @staticmethod
    def validate_share_link(link: ProjectShareLink):
        """Checks whether the link is valid, not expired, and not expired"""
        if not link.is_valid():
            if link.is_expired():
                raise PermissionDenied("Link has expired")
            if link.is_usage_exceeded():
                raise PermissionDenied("Link usage limit exceeded")
            raise PermissionDenied("Link is inactive")

    @staticmethod
    def create_share_link(
        project: Project,
        role_id: int,
        user,
        max_uses: int | None,
        expires_in: int,
    ):
        """
        Creates a new active link with the specified parameters:
        - role, lifetime in minutes, maximum number of uses
        """
        role = get_object_or_404(Role, id=role_id)
        expires_at = timezone.now() + timedelta(minutes=expires_in)

        share_link = ProjectShareLink.objects.create(
            project=project,
            role=role,
            max_uses=max_uses,
            expires_at=expires_at,
            created_by=user,
        )
        return share_link


class ProjectMembershipService:
    """
    Service for working with project membership:
    - assigning and changing roles
    """

    @staticmethod
    @transaction.atomic
    def assign_role(project, user, role):
        """
        Assigns or updates a user role in the project.
        Throws a ValidationError if:
        - the user is the project owner
        - the role has not changed
        """
        if user == project.owner:
            raise ValidationError("Cannot assign role to the project owner")

        membership = (
            ProjectMembership.objects
            .select_for_update()
            .filter(user=user, project=project)
            .first()
        )

        if membership:
            if membership.role == role:
                raise ValidationError("User already has this role in project")

            membership.role = role
            membership.save(update_fields=["role"])
        else:
            membership = ProjectMembership.objects.create(
                user=user, project=project, role=role
            )

        return membership
