from django.urls import path, include
from .views import (
    RegisterView, LoginView, LogoutView,
    UpdateProfileView, ProfileView,
    auth_page, user_page
)
from rest_framework_simplejwt.views import ( # Більшість під видалення
    TokenObtainPairView, TokenRefreshView,
    TokenVerifyView, TokenBlacklistView,
)

urlpatterns = [
    path("", include([
        path("", auth_page, name="auth_page"),
        path("register/", RegisterView.as_view(), name="register"),
        path("login/", LoginView.as_view(), name="login"),
        path('logout/', LogoutView.as_view(), name='logout'),
    ])),

    path("profile/", include([
        path("", user_page, name='user-page'),
        path("prf/", ProfileView.as_view(), name="profile"),
        path("update/", UpdateProfileView.as_view(), name="profile-update"),
    ])),
    
    path("token/", include([
        
        path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
        path('blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    ])),
]