import logging
from django.conf import settings
from rest_framework.permissions import BasePermission

from .models import ProjectMembership, Role

logger = logging.getLogger(__name__)


class IsProjectAdmin(BasePermission):
    """
    Permission class to check if a user is an admin of a project

    Checks if the user is the owner of the project or has an admin role
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user

        if hasattr(obj, "owner") and hasattr(obj, "id"):
            return self._check_access(user, obj)

        if isinstance(obj, Role):
            for membership in ProjectMembership.objects.filter(role=obj):
                if self._check_access(user, membership.project):
                    return True
            logger.warning(f"User {user.id} denied access to role {obj.id}")
            return False

        return False

    def _check_access(self, user, project):
        is_admin = ProjectMembership.objects.filter(
            user=user, project=project, role__name__in=settings.ADMIN_ROLE_NAMES
        ).exists()
        is_owner = project.owner == user

        if not (is_admin or is_owner):
            logger.warning(f"User {user.id} denied access to project {project.id}")

        return is_admin or is_owner


class IsProjectMinRole(BasePermission):
    """
    Permission class to check if a user has a certain role in a project
    """
    ROLE_ORDER = ['Viewer', 'Member', 'Moderator', 'Admin', 'Owner']
    
    def __init__(self, min_role: str):
        self.min_role = min_role

    def has_object_permission(self, request, view, obj):
        user = request.user
        if getattr(obj, 'owner', None) == user:
            return True

        try:
            user_role = ProjectMembership.objects.get(
                project=obj, user=user
            ).role.name
        except ProjectMembership.DoesNotExist:
            return False

        return self.ROLE_ORDER.index(user_role) >= self.ROLE_ORDER.index(self.min_role)