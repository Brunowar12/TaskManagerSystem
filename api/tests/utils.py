from datetime import timedelta
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class TestHelper:
    @staticmethod
    def create_test_user(client, email="testuser@example.com", password="testpassword123"):
        """
        Helper method to create and authenticate a test user
        """
        user_data = {"email": email, "password": password}
        client.post(reverse("register"), user_data)
        user = User.objects.get(email=email)
        response = client.post(reverse("login"), user_data)
        token = response.data.get("access")
        refresh = response.data.get("refresh")
        return user, token, refresh

    def get_valid_due_date(days=14):
        """
        Returns an ISO-formatted date that is in the future (in 'days' days from the current moment)
        Adds a 'Z' to indicate UTC if required by the API
        """
        future_date = timezone.now() + timedelta(days=days)
        return future_date.replace(microsecond=0).isoformat() + "Z"