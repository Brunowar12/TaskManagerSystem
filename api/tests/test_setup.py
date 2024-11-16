from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

class APITestSetup(APITestCase):
    def setUp(self):
        self.user_data = {
            "password": "testpassword123",
            "email": "testuser@example.com"
        }
        self.user = None
    
    def authenticate_user(self):
        self.client.post(reverse("register"), self.user_data)
        self.user = User.objects.get(email=self.user_data["email"])
        
        response = self.client.post(reverse("login"), {
            "email": self.user_data["email"],
            "password": self.user_data["password"]
        })
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])