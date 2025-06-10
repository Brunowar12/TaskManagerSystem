import logging

from django.conf import settings
from rest_framework.permissions import BasePermission

from .models import Project, ProjectMembership

logger = logging.getLogger(__name__)


def _get_project_from_obj(obj):
    """Gets a project object from any related object"""
    if isinstance(obj, Project):
        return obj
    return getattr(obj, "project", None)


def _user_is_owner(user, project):
    """Shortcut for project owner"""
    return project.owner_id == user.id


def _user_has_role(user, project, roles):
    """Checks if the user has one of the specified roles in the project"""
    return ProjectMembership.objects.filter(
        project=project, user=user, role__name__in=roles
    ).exists()


class IsProjectAdmin(BasePermission):
    """
    Permission class to check if a user is an admin of a project

    Checks if the user is the owner of the project or has an admin role
    """

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        project = _get_project_from_obj(obj)
        user = request.user

        if project is None:
            return False

        if _user_is_owner(user, project):
            return True

        is_admin = _user_has_role(user, project, settings.ADMIN_ROLE_NAMES)

        if not is_admin:
            logger.warning(
                f"User {user.id} lacks admin role for project {project.id}"
            )

        return is_admin


class IsProjectMinRole(BasePermission):
    """
    Permission class to check if a user has a certain role in a project
    """

    ROLE_ORDER = settings.ROLE_ORDER

    def __init__(self, min_role):
        if isinstance(min_role, (list, tuple)):
            if len(min_role) != 1:
                raise ValueError(f"Invalid role format: {min_role}")
            min_role = min_role[0]

        if not isinstance(min_role, str) or min_role not in self.ROLE_ORDER:
            raise ValueError(f"Unknown role: {min_role}")

        self.min_role = min_role

    def has_object_permission(self, request, view, obj) -> bool:
        project = _get_project_from_obj(obj)
        user = request.user

        if project is None:
            return False

        if _user_is_owner(user, project):
            return True

        try:
            membership = ProjectMembership.objects.select_related("role").get(
                project=obj, user=user
            )
        except ProjectMembership.DoesNotExist:
            return False

        user_rank = self.ROLE_ORDER.index(membership.role.name)
        min_rank = self.ROLE_ORDER.index(self.min_role)

        return user_rank >= min_rank
