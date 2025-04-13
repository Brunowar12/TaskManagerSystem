from rest_framework.permissions import BasePermission

class IsProjectAdmin(BasePermission):
    """
    Checks if the user is a project administrator
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        is_admin = request.user.project_memberships.filter(
            project=obj, role__name="Admin"
        ).exists()

        is_owner = getattr(obj, 'owner', None) == request.user

        return is_admin or is_owner