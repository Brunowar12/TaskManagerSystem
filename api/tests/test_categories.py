from rest_framework import status
from tasks.models import Category
from .test_setup import BaseAPITestCase


class CategoryAPITests(BaseAPITestCase):
    def test_create_category_success(self):
        data = {"name": "Work"}
        response = self.api_post(self.category_list_ep, data)
        json_data = response.json()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(json_data.get("name"), "Work")
        self.assertEqual(json_data.get("user"), self.user.id)

    def test_create_category_invalid_data(self):
        response = self.api_post(self.category_list_ep, {})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.json())

    def test_list_categories(self):
        Category.objects.create(name="Work", user=self.user)
        Category.objects.create(name="Personal", user=self.user)

        response = self.client.get(
            self.category_list_ep, 
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json().get("results", [])
        self.assertEqual(len(results), 2)

    def test_create_category_unauthenticated(self):
        self.client.credentials()
        response = self.client.post(
            self.category_list_ep,
            {"name": "Work"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        detail = response.json().get("detail", "")
        self.assertIn("Authentication credentials were not provided", detail)
