from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, RoleViewSet, ProjectMembershipViewSet, 
    PermissionViewSet, join_project
)

# ViewSet routers
router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"roles", RoleViewSet, basename="role")
router.register(r'permissions', PermissionViewSet, basename="permissions")
router.register(
    r"project-memberships",
    ProjectMembershipViewSet,
    basename="project-membership",
)

urlpatterns = [
    path("", include(router.urls)),
    path("projects/join/<uuid:token>/", join_project, name="join-project"),
    path(
        "projects/<int:pk>/delete-share-link/<int:link_id>/",
        ProjectViewSet.as_view({"delete": "delete_share_link"}),
        name="project-delete-share-link",
    ),
]
