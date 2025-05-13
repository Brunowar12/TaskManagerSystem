from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    TaskViewSet, CategoryViewSet
)

# ViewSet routers
router = SimpleRouter()
router.register(r'', TaskViewSet, basename='task')

management_router = SimpleRouter()
management_router.register(r"categories", CategoryViewSet, basename="category")

urlpatterns = [
    path('', include(router.urls)),
    path('manage/', include(management_router.urls)),
]