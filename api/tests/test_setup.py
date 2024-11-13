from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

class APITestSetup(APITestCase):
    def setUp(self):
        self.user_data = {
            "password": "testpassword123",
            "email": "testuser@example.com"
        }
    
    def authenticate_user(self):
        self.client.post(reverse("register"), self.user_data)
        
        response = self.client.post(reverse("login"), {
            "email": self.user_data["email"],
            "password": self.user_data["password"]
        })
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])