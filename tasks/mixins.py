import logging
from django.core.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission

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
