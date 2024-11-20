from django.urls import reverse
from .test_setup import APITestSetup
from rest_framework import status

class UserAPITests(APITestSetup):
    def test_user_registration(self):
        url = reverse("register")
        user_data = {"email": "newuser@example.com", "password": "newpassword123"}
        response = self.client.post(url, user_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, "User registration failed")
        self.assertEqual(response.data["email"], user_data["email"], "Email mismatch in registration response")

    def test_user_login(self):
        url = reverse("login")
        response = self.client.post(url, {"email": self.user.email, "password": "testpassword123"})

        self.assertEqual(response.status_code, status.HTTP_200_OK, "User login failed")
        self.assertIn("access", response.data, "Access token not included in login response")

    def test_profile_update(self):
        url = reverse("profile-update")
        response = self.client.patch(url, {"email": "updatedemail@example.com"})

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Profile update failed")
        self.assertEqual(response.data["email"], "updatedemail@example.com", "Email not updated in profile")