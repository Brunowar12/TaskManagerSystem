from rest_framework.permissions import BasePermission

class IsProjectAdmin(BasePermission):
    """
    Checks if the user is a project administrator
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        is_admin = request.user.project_memberships.filter(role__name="Admin").exists()
        is_owner = getattr(view.get_object(), 'owner', None) == request.user
        return is_admin or is_owner
