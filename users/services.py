from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer
)

User = get_user_model()

class UserService:
    @staticmethod
    def register_user(data):
        """
        Handle user registration

        Validates and saves the user via serializer
        """
        serializer = UserRegistrationSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()        
        return serializer.data

    @staticmethod
    def login_user(data):
        """
        Handle user login

        Validates credentials and returns JWT token payload
        """
        serializer = UserLoginSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    @staticmethod
    def logout_user(refresh_token):
        """
        Handle user logout by blacklisting the refresh token
        """
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return {"message": "Successfully logged out"}
        except TokenError as e:
            msg = str(e).lower()
            if "token is invalid or expired" in msg:
                raise ValueError("Token expired")
            elif "token is already blacklisted" in msg:
                raise ValueError("Token already revoked")
            else:
                raise ValueError("Invalid token format")

    @staticmethod
    def update_profile(user, data):
        """
        Handle profile update for the authenticated user
        """
        serializer = UserProfileSerializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return serializer.data