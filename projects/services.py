from django.core.exceptions import ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from .models import Project, ProjectMembership, ProjectShareLink, Role


class ProjectService:
    """
    Service for operations with projects
    """
    @staticmethod
    @transaction.atomic
    def create_project(owner, **data):
        project = Project.objects.create(owner=owner, **data)
        admin_role = Role.objects.get(name="Admin")
        ProjectMembership.objects.get_or_create(
            user=owner,
            project=project,
            defaults={"role": admin_role}
        )
        return project
    
    @staticmethod
    def get_project_or_404(pk, user):
        project = get_object_or_404(
            Project.objects.prefetch_related("memberships__role"), pk=pk
        )
        if not (
            project.owner == user
            or project.memberships.filter(user=user).exists()
        ):
            raise PermissionError("You do not have acces to this project")
        return project
    
class ProjectShareLinkService:
    @staticmethod
    def validate_share_link(link):
        if not link.is_valid():
            if link.is_expired():
                raise PermissionDenied("Link has expired")
            if link.is_usage_exceeded():
                raise PermissionDenied("Link usage limit exceeded")
            raise PermissionDenied("Link is inactive")
        
    @staticmethod
    def create_share_link(project, role_id, user, max_uses, expires_in):
        role = get_object_or_404(Role, id=role_id)
        expires_at = timezone.now() + timezone.timedelta(minutes=expires_in)

        share_link = ProjectShareLink.objects.create(
            project=project,
            role=role,
            max_uses=max_uses,
            expires_at=expires_at,
            created_by=user,
        )
        return share_link


class ProjectMembershipService:
    @staticmethod
    def assign_role(project, user, role):
        """
        Assigns a role to a user in the project. If the user already
        has another role, it updates it
        Throws a ValidationError if the rules are violated
        """
        if user == project.owner:
            raise ValidationError("Cannot assign role to the project owner")

        with transaction.atomic():
            existing_membership = (
                ProjectMembership.objects.select_for_update()
                .filter(user=user, project=project)
                .first()
            )

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
