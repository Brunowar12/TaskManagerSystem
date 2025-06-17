import logging
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger(__name__)


class UserQuerysetMixin:
    """
    Mixin for filtering a queryset by an authenticated user.
    Expects the parent class to have an implemented get_queryset() method
    """

    def get_queryset(self):
        base_queryset = super().get_queryset()
        model = getattr(base_queryset, "model", None)
        if not model:
            raise ImproperlyConfigured("Queryset has a model for filtering")
        if hasattr(model, "owner"):
            return base_queryset.filter(owner=self.request.user)
        if hasattr(model, "user"):
            return base_queryset.filter(user=self.request.user)
        raise ImproperlyConfigured(
            f"Model {model.__name__} does not have owner or user fields"
        )

    def perform_create(self, serializer):
        logger.debug(
            "Creating object %s by user_id=%s",
            serializer.Meta.model.__name__,
            self.request.user.pk,
        )
        save_kwargs = {}
        if hasattr(serializer.Meta.model, "owner"):
            save_kwargs["owner"] = self.request.user
        elif hasattr(serializer.Meta.model, "user"):
            save_kwargs["user"] = self.request.user
        else:
            raise ImproperlyConfigured(
                "The model does not support user-based creation"
            )
        serializer.save(**save_kwargs)
