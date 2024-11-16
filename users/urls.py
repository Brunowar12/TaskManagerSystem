from django.urls import path
from . import views
from .views import RegisterView, LoginView, UpdateProfileView, auth_page
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', auth_page, name='auth_page'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/update/', UpdateProfileView.as_view(), name='profile-update')
]
