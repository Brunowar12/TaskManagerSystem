from datetime import timedelta
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

DEFAULT_TEST_EMAIL = "testuser@example.com"
DEFAULT_TEST_PASSWORD = "testpassword123"


class TokenService:
    """
    Utility class for generating tokens

    Methods:
        generate_tokens_for: Generates access and refresh tokens for the specified user
    """

    @staticmethod
    def generate_tokens_for(user):
        refresh_obj = RefreshToken.for_user(user)
        return {
            "access": str(refresh_obj.access_token),
            "refresh": str(refresh_obj),
        }


class TestHelper:
    @staticmethod
    def create_test_user(client, email=DEFAULT_TEST_EMAIL, password=DEFAULT_TEST_PASSWORD):
        """
        Creates a test user by registering and logging in through the API

        Args:
            client: The test client instance.
            email (str): The email address of the test user. 
                Defaults to "testuser@example.com"
            password (str): The password of the test user. 
                Defaults to "testpassword123"

        Returns:
            tuple: A tuple containing the created user instance, access token, and 
                refresh token

        Raises:
            AssertionError: If user registration or login fails
        """
        user_data = {"email": email, "password": password}
        response = client.post(reverse("auth-register"), user_data)
        if response.status_code != status.HTTP_201_CREATED:
            raise AssertionError(f"User registration failed: {response.data}")

        user = User.objects.get(email=email)
        response = client.post(reverse("auth-login"), user_data)
        if response.status_code != status.HTTP_200_OK:
            raise AssertionError(f"User login failed: {response.data}")

        token = response.data.get("access")
        refresh = response.data.get("refresh")

        return user, token, refresh

    @staticmethod
    def create_test_user_via_orm(email=DEFAULT_TEST_EMAIL, password=DEFAULT_TEST_PASSWORD):
        """
        Creates a test user via ORM

        Args:
            email (str): The email address of the test user. 
                Defaults to "testuser@example.com"
            password (str): The password of the test user. 
                Defaults to "testpassword123"

        Returns:
            tuple: A tuple containing the created user instance, access token, 
                and refresh token
        """
        user = User.objects.create_user(
            username=email.split("@")[0], email=email, password=password
        )
        tokens = TokenService.generate_tokens_for(user)

        return user, tokens["access"], tokens["refresh"]

    @staticmethod
    def get_valid_due_date(days: int = 14):
        """
        Returns a valid due date in ISO format

        Args:
            days (int): The number of days from the current date. Defaults to 14

        Returns:
            str: A future date in ISO format (YYYY-MM-DDTHH:MM:SSZ)
                with microseconds set to 0
        """
        future_date = timezone.now() + timedelta(days=days)
        return future_date.replace(microsecond=0).isoformat() + "Z"
