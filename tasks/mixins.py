import logging
from django.core.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission

logger = logging.getLogger(__name__)

class UserQuerysetMixin:
    """
    Mixin for filtering a queryset by an authenticated user.
    Expects the parent class to have an implemented get_queryset() method
    """    

    def get_queryset(self):
        base_queryset = super().get_queryset()
        return base_queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        logger.debug(f"Request perform_create for User: {self.request.user}")
        serializer.save(user=self.request.user)


class IsOwner(BasePermission):
    """
    Checking whether the user is the owner of the object
    """
    def has_object_permission(self, request, view, obj):
        if not hasattr(obj, "user"):
            logger.error(f"Access check failed: object {obj} has no 'user' attribute.")
            raise PermissionDenied("Access denied: missing ownership information.")
        return obj.user == request.user