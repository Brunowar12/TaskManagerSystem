from django.urls import reverse
from rest_framework import status
from .test_setup import APITestSetup

class TaskAPITests(APITestSetup):
    def test_task_creation(self):
        url = reverse("task-create")
        task_data = {"title": "Test Task", "due_date": "2024-12-31T00:00:00Z"}
        response = self.client.post(url, task_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, "Task creation failed")
        self.assertEqual(response.data["title"], task_data["title"], "Task title mismatch")
        self.assertEqual(response.data["user"], self.user.id, "Task user mismatch")

    def test_task_detail_invalid_id(self):
        response = self.client.get(reverse("task-detail", kwargs={"pk": 999}))

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Invalid task ID did not return 404",
        )

    def test_task_update(self):
        task = self.client.post(
            reverse("task-create"),
            {"title": "Old Task", "due_date": "2024-12-31T00:00:00Z"},
        ).data
        url = reverse("task-detail", kwargs={"pk": task["id"]})
        response = self.client.patch(url, {"title": "Updated Task"})

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Task update failed")
        self.assertEqual(response.data["title"], "Updated Task", "Task title not updated")