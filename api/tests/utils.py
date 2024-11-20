from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class TestHelper:
    @staticmethod
    def create_test_user(client, email="testuser@example.com", password="testpassword123"):
        """
        Helper method to create and authenticate a test user.
        """
        user_data = {"email": email, "password": password}
        client.post(reverse("register"), user_data)
        user = User.objects.get(email=email)
        response = client.post(reverse("login"), user_data)
        token = response.data.get("access", None)
        return user, token