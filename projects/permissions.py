import logging
from django.conf import settings
from rest_framework.permissions import BasePermission
from .models import ProjectMembership, Role

logger = logging.getLogger(__name__)

class IsProjectAdmin(BasePermission):
    """
    Checks if the user is a project administrator.
    For Project objects, the standard check is performed on the owner and project_memberships fields.
    For Role objects, it checks whether the user has membership in at least one project, 
    where this role is applied, and whether the user is an administrator or owner of this project
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'owner'):
            is_admin = request.user.project_memberships.filter(
                project=obj, role__name__in=settings.ADMIN_ROLE_NAMES
            ).exists()
            is_owner = obj.owner == request.user
            
            if not (is_admin or is_owner):
                logger.warning(f"User {request.user.id} denied access to project {obj.id}")
            return is_admin or is_owner
        
        elif isinstance(obj, Role):
            memberships = ProjectMembership.objects.filter(role=obj)
            for membership in memberships:
                project = membership.project
                is_admin = request.user.project_memberships.filter(
                    project=project, role__name__in=settings.ADMIN_ROLE_NAMES
                ).exists()
                is_owner = project.owner == request.user
                if is_admin or is_owner:
                    return True
            logger.warning(f"User {request.user.id} denied access to role {obj.id} (no admin membership found)")
            return False
        
        return False
