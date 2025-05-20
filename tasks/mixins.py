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
            logger.error("Object has no ownership attribute")
            raise PermissionDenied(
                "Access denied: missing ownership information"
            )
            
        return user_field == request.user
    

class ProjectTaskPermission(BasePermission):
    """    
    Checking whether the user has the required permission for the project task
    """
    def has_permission(self, request, view):
        project_pk = view.kwargs.get('project_pk')
        if not project_pk:
            return True

        if request.method in SAFE_METHODS:
            min_role = 'Viewer'
        elif request.method in ('PUT', 'PATCH'):
            min_role = 'Member'
        else:
            min_role = 'Moderator'

        return IsProjectMinRole(min_role).has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)