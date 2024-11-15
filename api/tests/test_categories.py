from django.urls import reverse
from rest_framework import status
from .test_setup import APITestSetup
from users.models import Category

# тести не працюють, треба фікси
class CategoryAPITests(APITestSetup):
    def test_create_category_success(self):
        """Test successful creation of a category."""
        url = reverse("category-create")
        data = {"name": "Work"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Work")
        self.assertEqual(response.data["user"], self.user.id)

    def test_create_category_unauthenticated(self):
        """Test that unauthenticated users cannot create categories."""
        self.client.force_authenticate(user=None)  # Відключаємо автентифікацію
        url = reverse("category-create")
        data = {"name": "Work"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_categories(self):
        """Test retrieving a list of categories."""
        Category.objects.create(name="Work", user=self.user)
        Category.objects.create(name="Personal", user=self.user)
        url = reverse("category-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_category_missing_name(self):
        """Test that a category cannot be created without a name."""
        url = reverse("category-create")
        data = {}  # Порожнє тіло запиту
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)
