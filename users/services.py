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
        Processing of user registration. Validated data is transferred through the serializer.
        """
        serializer = UserRegistrationSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return serializer.data

    @staticmethod
    def login_user(data):
        """
        User login processing. Authentication and return of JWT tokens are performed.
        """
        serializer = UserLoginSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        return serializer.validated_data

    @staticmethod
    def logout_user(refresh_token):
        """
        User logout processing (blacklist refresh-token).
        """
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return {"message": "Successfully logged out"}
        except TokenError as e:
            raise ValueError(f"Invalid token: {str(e)}")

    @staticmethod
    def update_profile(user, data):
        """
        Update your user profile.
        """
        serializer = UserProfileSerializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return serializer.data