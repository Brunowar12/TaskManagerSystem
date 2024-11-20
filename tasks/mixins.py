import logging
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)

class UserQuerysetMixin:
    """
    Mixin to filter queryset for the authenticated user
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        model = self.serializer_class.Meta.model
        return model.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        logger.info(f"Request User: {self.request.user}")
        serializer.save(user=self.request.user)