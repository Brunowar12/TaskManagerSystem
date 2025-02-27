from django.urls import reverse
from rest_framework import status
from users.models import Category
from .test_setup import BaseAPITestCase

class CategoryAPITests(BaseAPITestCase):
    def test_create_category_success(self):
        url = reverse("category-list")
        data = {"name": "Work"}
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, "Category creation failed")
        self.assertEqual(response.data.get("name"), data["name"], "Category name mismatch")
        self.assertEqual(response.data.get("user"), self.user.id, "Category user mismatch")

    def test_create_category_invalid_data(self):
        url = reverse("category-list")
        response = self.client.post(url, {})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Invalid category data not handled")
        self.assertIn("name", response.data, "Missing validation error for category name")

    def test_list_categories(self):
        Category.objects.create(name="Work", user=self.user)
        Category.objects.create(name="Personal", user=self.user)
        url = reverse("category-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Category listing failed")
        self.assertEqual(len(response.data.get("results", [])), 2, "Category count mismatch")
