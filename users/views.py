from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from api.utils import error_response

from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer
)
from .services import UserService

class AuthViewSet(viewsets.GenericViewSet):
    """
    Handles user registration, login, and logout
    """
    throttle_classes = [AnonRateThrottle]

    def get_serializer_class(self):
        if getattr(self, 'swagger_fake_view', False):
            return serializers.Serializer
        
        if self.action == 'register':
            return UserRegistrationSerializer
        elif self.action == 'login':
            return UserLoginSerializer

    def get_permissions(self):
        if self.action in ['register', 'login']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'])
    def register(self, request):
        data = UserService.register_user(request.data)
        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def login(self, request):
        data = UserService.login_user(request.data)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return error_response("Refresh token is required")
        try:
            data = UserService.logout_user(refresh_token)
            return Response(data, status=status.HTTP_200_OK)
        except ValueError as e:
            return error_response(str(e))
        except Exception as e:
            return error_response(
                f"Unexpected error {str(e)}",
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    

class UserViewSet(viewsets.GenericViewSet):
    """
    Handles viewing and updating user profile
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        data = UserService.update_profile(request.user, request.data)
        return Response(data)