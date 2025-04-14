from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TaskViewSet, CategoryViewSet
)

# ViewSet routers
router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')

# Another router
management_router = DefaultRouter()
management_router.register(r"categories", CategoryViewSet, basename="category")

urlpatterns = [
    path('', include(router.urls)),
    path('manage/', include(management_router.urls)),
]