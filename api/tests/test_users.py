from django.urls import reverse
from rest_framework import status
from .test_setup import BaseAPITestCase

class UserAPITests(BaseAPITestCase):
    def test_user_registration(self):
        url = reverse("user-register")
        user_data = {"email": "newuser@example.com", "password": "newpassword123"}
        response = self.client.post(url, user_data)        
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, "User registration failed")
        self.assertEqual(response.data.get("email"), user_data["email"], "Email mismatch in registration response")

    def test_user_login(self):
        url = reverse("user-login")
        response = self.client.post(url, {"email": self.user.email, "password": "testpassword123"})

        self.assertEqual(response.status_code, status.HTTP_200_OK, "User login failed")
        self.assertIn("access", response.data, "Access token not included in login response")

    def test_profile_update(self):
        url = reverse("user-update-profile")
        response = self.client.patch(url, {"email": "updatedemail@example.com"})

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Profile update failed")
        self.assertEqual(response.data.get("email"), "updatedemail@example.com", "Email not updated in profile")
        
    def test_profile_retrieval(self):
        url = reverse("user-profile")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Profile retrieval failed")
        self.assertEqual(response.data.get("email"), self.user.email, "Email mismatch in profile response")

    def test_user_logout(self):
        url = reverse("user-logout")
        response = self.client.post(url, {"refresh": self.refresh})

        self.assertEqual(response.status_code, status.HTTP_200_OK, "User logout failed")
        self.assertEqual(response.data.get("message"), "Successfully logged out", "Logout message mismatch")

    def test_user_registration_invalid_email(self):
        url = reverse("user-register")
        user_data = {"email": "invalid-email", "password": "newpassword123"}
        response = self.client.post(url, user_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Invalid email registration did not fail")
        self.assertIn("email", response.data, "Email validation error not included in response")

    def test_user_registration_weak_password(self):
        url = reverse("user-register")
        user_data = {"email": "newuser@example.com", "password": "weak"}
        response = self.client.post(url, user_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Weak password registration did not fail")
        self.assertIn("password", response.data, "Password validation error not included in response")

    def test_user_login_invalid_credentials(self):
        url = reverse("user-login")
        response = self.client.post(url, {"email": self.user.email, "password": "wrongpassword"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Login with invalid credentials did not fail")
        self.assertIn("Invalid credentials", response.data.get("non_field_errors", ""), "Invalid credentials error not included in response")

    def test_profile_update_unauthenticated(self):
        self.client.credentials()
        url = reverse("user-update-profile")
        response = self.client.patch(url, {"email": "updatedemail@example.com"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, "Unauthenticated profile update did not fail")
        self.assertIn("Authentication credentials were not provided", response.data.get("detail", ""), "Authentication error not included in response")

    def test_user_logout_invalid_token(self):
        url = reverse("user-logout")
        response = self.client.post(url, {"refresh": "invalid-refresh-token"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Logout with invalid token did not fail")
        self.assertIn("Token is invalid or expired", response.data.get("error", ""), "Invalid token error not included in response")