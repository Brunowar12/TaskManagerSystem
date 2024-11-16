from django.urls import reverse
from rest_framework import status
from .test_setup import APITestSetup
from users.models import Category

class CategoryAPITests(APITestSetup):
    def test_create_category_success(self):
        """Test successful creation of a category."""
        self.authenticate_user()
        url = reverse("category-create")
        data = {"name": "Work"}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Work")
        self.assertEqual(response.data["user"], self.user.id)

    def test_create_category_unauthenticated(self):
        """Test that unauthenticated users cannot create categories."""
        self.client.force_authenticate(user=None)
        url = reverse("category-create")
        data = {"name": "Work"}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_categories(self):
        """Test retrieving a list of categories."""
        self.authenticate_user()
        Category.objects.create(name="Work", user=self.user)
        Category.objects.create(name="Personal", user=self.user)
        url = reverse("category-list")
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

    def test_create_category_missing_name(self):
        """Test that a category cannot be created without a name."""
        self.authenticate_user()
        url = reverse("category-create")
        data = {}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)