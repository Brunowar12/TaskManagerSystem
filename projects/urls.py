from django.urls import path, include
from rest_framework_nested import routers

from tasks.views import TaskViewSet

from .views import (
    ProjectViewSet, RoleViewSet, ProjectMembershipViewSet, 
    PermissionViewSet, join_project
)

# ViewSet routers
router = routers.DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"roles", RoleViewSet, basename="role")
router.register(r'permissions', PermissionViewSet, basename="permissions")
router.register(
    r"project-memberships",
    ProjectMembershipViewSet,
    basename="project-membership",
)

projects_router = routers.NestedDefaultRouter(router, r"projects", lookup="project")
projects_router.register(r"tasks", TaskViewSet, basename="project-tasks")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(projects_router.urls)),
    path("projects/join/<uuid:token>/", join_project, name="join-project"),
    path(
        "projects/<int:pk>/delete-share-link/<int:link_id>/",
        ProjectViewSet.as_view({"delete": "delete_share_link"}),
        name="project-delete-share-link",
    ),
]
