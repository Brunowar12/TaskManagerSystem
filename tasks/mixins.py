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
        if hasattr(base_queryset.model, 'owner'):
            return base_queryset.filter(owner=self.request.user)
        return base_queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        logger.debug(f"Request perform_create for User: {self.request.user}")
        if hasattr(serializer.Meta.model, 'owner'):
            serializer.save(owner=self.request.user)
        else:
            serializer.save(user=self.request.user)


class IsOwner(BasePermission):
    """
    Checking whether the user is the owner of the object
    """
    def has_object_permission(self, request, view, obj):
        user_field = getattr(obj, 'user', None) or getattr(obj, 'owner', None)
        if user_field is None:
            logger.error("Object has no ownership attribute")
            raise PermissionDenied("Access denied: missing ownership information.")
        return user_field == request.user