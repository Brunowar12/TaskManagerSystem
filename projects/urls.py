from django.urls import path, include
from rest_framework_nested import routers

from tasks.views import TaskViewSet

from .views import (
    ProjectShareLinkViewSet, ProjectViewSet, RoleViewSet, 
    ProjectMembershipViewSet, join_project
)

# ViewSet routers
router = routers.DefaultRouter()
router.register(r"roles", RoleViewSet, basename="role")
router.register(
    r"project-memberships",
    ProjectMembershipViewSet,
    basename="project-membership",
)
router.register(r"", ProjectViewSet, basename="project")

projects_router = routers.NestedDefaultRouter(
    router, r"", lookup="project"
)
projects_router.register(r"tasks", TaskViewSet, basename="project-tasks")
projects_router.register(r"share_links", ProjectShareLinkViewSet, basename="project-share-links")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(projects_router.urls)),
    path("join/<uuid:token>/", join_project, name="join-project"),
]
