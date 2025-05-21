import logging

from django.core.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission, SAFE_METHODS

from projects.permissions import IsProjectMinRole

logger = logging.getLogger(__name__)


class IsOwner(BasePermission):
    """
    Checking whether the user is the owner of the object
    """
    
    def has_object_permission(self, request, view, obj):
        user_field = getattr(obj, "user", None) or getattr(obj, "owner", None)
        
        if user_field is None:
            logger.error(f"Object {type(obj).__name__} has no ownership attribute")
            raise PermissionDenied(
                "Access denied: missing ownership information"
            )
            
        return user_field == request.user
    

class ProjectTaskPermission(BasePermission):
    """    
    Checking whether the user has the required permission for the project task
    """
    def _get_min_role(self, method):
        if method in SAFE_METHODS:
            return 'Viewer'
        elif method in ('PUT', 'PATCH'):
            return 'Member'
        return 'Moderator'
    
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        project = getattr(obj, 'project', None)
        if project is None:
            return True
        
        min_role = self._get_min_role(request.method)
        
        return IsProjectMinRole(min_role).has_object_permission(request, view, obj)