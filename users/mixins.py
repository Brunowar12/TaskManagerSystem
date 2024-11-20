from rest_framework.permissions import IsAuthenticated

class GetAuthenticatedUserMixin:
    """
    Mixin to retrieve the authenticated user instance
    """
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user