from django.urls import reverse
from .test_setup import APITestSetup
from rest_framework import status

class UserAPITests(APITestSetup):
    def test_user_registration(self):
        url = reverse("register")
        
        response = self.client.post(url, self.user_data)
        
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            print("Validation errors:", response.data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], self.user_data["email"])
        
    def test_user_login(self):
        url = reverse("login")
        
        self.client.post(reverse("register"), self.user_data)
        response = self.client.post(url, {
            "email": self.user_data["email"],
            "password": self.user_data["password"]
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        
    def test_profile_update(self):
        self.authenticate_user()
        url = reverse("profile-update")
        response = self.client.patch(url, {"email": "newemail@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "newemail@example.com")