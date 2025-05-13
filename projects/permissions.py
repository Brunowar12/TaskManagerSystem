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



class IsProjectRole(BasePermission):
    """
    Permission class to check if a user has a specific role in a project

    Subclasses should define the `role_names` attribute with a list of allowed role names
    
    Grants access if user.owner or has role.name from the allowed_roles list
    """
    def __init__(self, *, role_names: list[str]):
        self.role_names = role_names

    def has_object_permission(self, request, view, obj):
        user = request.user
        if hasattr(obj, 'owner') and obj.owner == user:
            return True

        return ProjectMembership.objects.filter(
            project=obj,
            user=user,
            role__name__in=self.role_names
        ).exists()


class IsProjectOwner(IsProjectRole):
    def __init__(self):
        super().__init__(role_names=['Owner'])

class IsProjectAdminRole(IsProjectRole):
    def __init__(self):
        super().__init__(role_names=settings.ADMIN_ROLE_NAMES)
        
class IsProjectModeratorRole(IsProjectRole):
    def __init__(self):
        super().__init__(role_names=['Moderator'])

class IsProjectMemberRole(IsProjectRole):
    def __init__(self):
        super().__init__(role_names=['Member'])

class IsProjectViewerRole(IsProjectRole):
    def __init__(self):
        super().__init__(role_names=['Viewer'])