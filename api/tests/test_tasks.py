from django.urls import reverse
from rest_framework import status
from .test_setup import APITestSetup

class TaskAPITests(APITestSetup):
    def test_task_creation(self):
        self.authenticate_user()
        url = reverse("task-create")
        task_data = {"title": "Test Task", "due_date": "2024-12-31T00:00:00Z"}

        response = self.client.post(url, task_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Test Task")
        self.assertEqual(response.data["user"], self.user.id)

    def test_task_detail(self):
        self.authenticate_user()
        task = self.client.post(
            reverse("task-create"),
            {"title": "Test Task", "due_date": "2024-12-31T00:00:00Z"},
        ).data
        response = self.client.get(reverse("task-detail", kwargs={"pk": task["id"]}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Task")
        self.assertEqual(response.data["user"], self.user.id)

    def test_task_update(self):
        self.authenticate_user()
        task = self.client.post(
            reverse("task-create"),
            {"title": "Test Task", "due_date": "2024-12-31T00:00:00Z"},
        ).data
        url = reverse("task-detail", kwargs={"pk": task["id"]})

        response = self.client.patch(url, {"title": "Updated Task"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Task")

    def test_task_delete(self):
        self.authenticate_user()
        task = self.client.post(
            reverse("task-create"),
            {"title": "Test Task", "due_date": "2024-12-31T00:00:00Z"},
        ).data
        url = reverse("task-detail", kwargs={"pk": task["id"]})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_task_creation_with_invalid_data(self):
        self.authenticate_user()
        url = reverse("task-create")
        invalid_task_data = {"title": "", "due_date": "invalid-date"}

        response = self.client.post(url, invalid_task_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("due_date", response.data)
        self.assertIn("title", response.data)

    def test_task_creation_missing_due_date(self):
        self.authenticate_user()
        url = reverse("task-create")
        incomplete_task_data = {"title": "Test Task"}

        response = self.client.post(url, incomplete_task_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("due_date", response.data)