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
        # Used for schema generation
        if getattr(self, "swagger_fake_view", False):
            return serializers.Serializer

        # Dynamically choose serializer based on action
        if self.action == "register":
            return UserRegistrationSerializer
        if self.action == "login":
            return UserLoginSerializer

    def get_permissions(self):
        if self.action in ["register", "login"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["post"])
    def register(self, request):
        """Registers a new user"""
        data = UserService.register_user(request.data)
        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def login(self, request):
        """Logs in a user and returns tokens"""
        data = UserService.login_user(request.data)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def logout(self, request):
        """Logs out a user by blacklisting the refresh token"""
        refresh_token = request.data.get("refresh")
        error_messages_map = {
            "Invalid token format": "Incorrect token format",
            "Token expired": "Expired token",
            "Token already revoked": "The token has already been revoked",
        }

        if not refresh_token:
            return error_response("Refresh token is required")

        try:
            data = UserService.logout_user(refresh_token)
            return Response(data, status=status.HTTP_200_OK)
        except ValueError as e:
            user_message = error_messages_map.get(
                str(e), "Unknown token error"
            )
            return error_response(
                user_message, status.HTTP_401_UNAUTHORIZED, exc=e
            )
        except Exception as e:
            return error_response(
                "Internal server error",
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                exc=e,
            )


class UserViewSet(viewsets.GenericViewSet):
    """
    Handles viewing and updating the authenticated user's profile
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    @action(detail=False, methods=["get"])
    def profile(self, request):
        """Returns the authenticated user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=["put", "patch"])
    def update_profile(self, request):
        """Updates the authenticated user's profile"""
        data = UserService.update_profile(request.user, request.data)
        return Response(data)
