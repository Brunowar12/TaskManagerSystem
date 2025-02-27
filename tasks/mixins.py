import logging
from rest_framework.permissions import IsAuthenticated, BasePermission

logger = logging.getLogger(__name__)

class UserQuerysetMixin:
    """
    Mixin to filter queryset for the authenticated user
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        logger.info(f"Request User: {self.request.user}")
        serializer.save(user=self.request.user)
        
class IsOwner(BasePermission):
    """
    Checking whether the user is the owner of the object
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user