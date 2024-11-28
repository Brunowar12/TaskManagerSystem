from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView,
    UpdateProfileView, ProfileView,
    auth_page,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView,
    TokenVerifyView, TokenBlacklistView,
)

urlpatterns = [
    path("", auth_page, name="auth_page"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    # path('logout/', LogoutView.as_view(), name='logout'),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/update/", UpdateProfileView.as_view(), name="profile-update"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
]
