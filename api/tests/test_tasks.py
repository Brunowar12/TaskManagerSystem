from datetime import datetime, timedelta
from django.urls import reverse
from django.utils.timezone import now, make_aware
from rest_framework import status
from tasks.models import Task
from .test_setup import BaseAPITestCase
from .utils import TestHelper

class TaskAPITests(BaseAPITestCase):
    def setUp(self):
        super().setUp()

        # Turning "naive" dates into "aware" dates
        today = now().date()
        future_date = make_aware(datetime.combine((now().date() + timedelta(days=365)), datetime.min.time()))

        # Create test tasks
        self.task_today = Task.objects.create(
            title="Today Task",
            due_date=make_aware(datetime.combine(today, datetime.min.time())),
            user=self.user,
            is_favorite=True
        )
        self.task_future = Task.objects.create(
            title="Future Task",
            due_date=future_date,
            user=self.user,
            is_favorite=False
        )
    
    # default tests
    def test_task_creation(self):
        url = reverse("task-list")
        task_data = {"title": "Test Task", "due_date": TestHelper.get_valid_due_date()}
        response = self.client.post(url, task_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, "Task creation failed")
        self.assertEqual(response.data["title"], task_data["title"], "Task title mismatch")
        self.assertEqual(response.data["user"], self.user.id, "Task user mismatch")

    def test_task_update(self):
        task = self.client.post(
            reverse("task-list"),
            {"title": "Old Task", "due_date": TestHelper.get_valid_due_date()}
        ).data
        url = reverse("task-detail", kwargs={"pk": task["id"]})
        response = self.client.patch(url, {"title": "Updated Task"})

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Task update failed")
        self.assertEqual(response.data["title"], "Updated Task", "Task title not updated")
        
    def test_task_deletion(self):
        task = self.client.post(
            reverse("task-list"),
            {"title": "Task to Delete", "due_date": TestHelper.get_valid_due_date()}
        ).data
        url = reverse("task-detail", kwargs={"pk": task["id"]})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT, "Task deletion failed")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND, "Task not deleted")

    # advanced scenarios tests    
    def test_task_detail_invalid_id(self):
        response = self.client.get(reverse("task-detail", kwargs={"pk": 999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND, "Invalid task ID did not return 404")
    
    def test_task_creation_unauthenticated(self):
        url = reverse("task-list")
        task_data = {"title": "Test Task", "due_date": TestHelper.get_valid_due_date()}
        self.client.credentials()
        response = self.client.post(url, task_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, "Unauthenticated task creation did not fail")
        self.assertIn("Authentication credentials were not provided", response.data.get("detail", ""), "Authentication error not included in response")

    def test_task_update_unauthenticated(self):
        task = self.client.post(
            reverse("task-list"),
            {"title": "Old Task", "due_date": TestHelper.get_valid_due_date()}
        ).data
        url = reverse("task-detail", kwargs={"pk": task["id"]})
        self.client.credentials()
        response = self.client.patch(url, {"title": "Updated Task"})
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, "Unauthenticated task update did not fail")
        self.assertIn("Authentication credentials were not provided", response.data.get("detail", ""), "Authentication error not included in response")

    def test_task_deletion_unauthenticated(self):
        task = self.client.post(
            reverse("task-list"),
            {"title": "Task to Delete", "due_date": TestHelper.get_valid_due_date()}
        ).data
        url = reverse("task-detail", kwargs={"pk": task["id"]})
        self.client.credentials()
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, "Unauthenticated task deletion did not fail")
        self.assertIn("Authentication credentials were not provided", response.data.get("detail", ""), "Authentication error not included in response")

    def test_task_creation_invalid_due_date(self):
        url = reverse("task-list")
        task_data = {"title": "Test Task", "due_date": "invalid-date"}
        response = self.client.post(url, task_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Invalid due date registration did not fail")
        self.assertIn("due_date", response.data, "Due date validation error not included in response")

    def test_task_creation_missing_title(self):
        url = reverse("task-list")
        task_data = {"due_date": TestHelper.get_valid_due_date()}
        response = self.client.post(url, task_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Task creation without title did not fail")
        self.assertIn("title", response.data, "Title validation error not included in response")

    def test_task_creation_missing_due_date(self):
        url = reverse("task-list")
        task_data = {"title": "Test Task"}
        response = self.client.post(url, task_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Task creation without due date did not fail")
        self.assertIn("due_date", response.data, "Due date validation error not included in response")
        
    # Filtering tests        
    def test_filter_by_status(self):
        self.task_today.completed = False
        self.task_today.save()
        
        self.task_future.completed = True
        self.task_future.save()
        
        response = self.client.get(reverse("task-list"), {"completed": "False"})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK, "Filtering by status does not work")
        self.assertEqual(len(response.data.get("results", [])), 1, "Incorrect number of tasks")
        self.assertFalse(response.data["results"][0]["completed"], "Incorrect task returned")

    def test_filter_by_priority(self):
        self.task_today.priority = "M"
        self.task_today.save()
        
        self.task_future.priority = "L"
        self.task_future.save()
        
        response = self.client.get(reverse("task-list"), {"priority": "M"})

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Filtering by priority does not work")
        self.assertEqual(len(response.data.get("results", [])), 1, "Incorrect number of tasks")
        self.assertEqual(response.data["results"][0]["priority"], "M", "Incorrect task returned")

    def test_filter_by_today(self):
        response = self.client.get(reverse("task-list"), {"today": "true"})

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Filtering by today does not work")
        self.assertEqual(len(response.data.get("results", [])), 1, "Incorrect number of tasks")
        self.assertEqual(
            response.data["results"][0]["due_date"].split("T")[0],
            now().date().isoformat(),
            "Incorrect date of the task"
        )

    def test_combined_filters(self):
        self.task_today.priority = "H"
        self.task_today.save()
        
        response = self.client.get(reverse("task-list"), {"search": "Today", "priority": "H"})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK, "Filtering with a combination of parameters does not work")
        self.assertEqual(len(response.data.get("results", [])), 1, "Incorrect number of tasks")
        self.assertEqual(response.data["results"][0]["title"], "Today Task", "Incorrect task returned")
        
    def test_sorting_by_title(self):
        response = self.client.get(reverse("task-list"), {"ordering": "title"})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK, "Sorting by title does not work")
        titles = [task["title"] for task in response.data.get("results", [])]
        expected_titles = sorted([self.task_today.title, self.task_future.title])
        self.assertEqual(titles, expected_titles, "Tasks are not sorted correctly by title")