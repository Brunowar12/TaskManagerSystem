from django.urls import path, include
from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import UserViewSet, AuthViewSet

router = SimpleRouter()
router.register(r"", AuthViewSet, basename="auth")
router.register(r"", UserViewSet, basename="user")


urlpatterns = [
    path('', include(router.urls)),

    # JWT Token endpoints
    path("token/", include([        
        path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    ])),
]
