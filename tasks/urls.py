from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TaskViewSet, CategoryViewSet, ProjectViewSet,
    RoleViewSet, ProjectMembershipViewSet,
)

# ViewSet routers
router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')

# Another router
management_router = DefaultRouter()
management_router.register(r"categories", CategoryViewSet, basename="category")
management_router.register(r"projects", ProjectViewSet, basename="project")
management_router.register(r"roles", RoleViewSet, basename="role")
management_router.register(
    r"project-memberships",
    ProjectMembershipViewSet,
    basename="project-membership",
)

urlpatterns = [
    path('', include(router.urls)),
    path('manage/', include(management_router.urls)),
]