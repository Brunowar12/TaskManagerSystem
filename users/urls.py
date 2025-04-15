from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    
    # Token URLs remain separate
    path("token/", include([        
        path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
        path('blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    ])),
]