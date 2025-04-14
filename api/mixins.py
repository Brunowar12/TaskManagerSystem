import logging

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