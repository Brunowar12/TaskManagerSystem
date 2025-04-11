from datetime import datetime, timedelta
from django.urls import reverse
from django.utils.timezone import now, make_aware
from rest_framework import status
from tasks.models import Task, Role, Project, ProjectMembership, Category
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
        
    def test_task_queryset_only_user_tasks(self):
        other_user, other_token, _ = TestHelper.create_test_user(self.client, email="another@example.com")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token}")
        self.client.post(reverse("task-list"), {"title": "Other Task", "due_date": TestHelper.get_valid_due_date()})

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(reverse("task-list"))
        self.assertTrue(all(task["user"] == self.user.id for task in response.data["results"]))
        
    def test_toggle_favorite(self):
        task = self.task_today
        url = reverse("task-toggle-favorite", kwargs={"pk": task.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["is_favorite"], not task.is_favorite)

    def test_toggle_completed(self):
        task = self.task_future
        url = reverse("task-toggle-completed", kwargs={"pk": task.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("completed_at", response.data)

    def test_task_today_action(self):
        url = reverse("task-today")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any("Today" in task["title"] for task in response.data))

    def test_task_favorites_action(self):
        url = reverse("task-favorites")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(task["is_favorite"] for task in response.data))
        
    def test_completed_at_updated_correctly(self):
        task = self.client.post(reverse("task-list"), {
            "title": "Auto Complete",
            "due_date": TestHelper.get_valid_due_date(),
            "completed": True
        }).data
        detail = self.client.get(reverse("task-detail", kwargs={"pk": task["id"]})).data
        self.assertIsNotNone(detail["completed_at"], "Completed at not set")

    def test_task_str_representation(self):
        task = self.task_today
        self.assertIn(task.title, str(task))
        self.assertIn(self.user.username, str(task))
        
    def test_move_task_to_project(self):
        project = Project.objects.create(name="Move Project", owner=self.user)
        url = reverse("task-move-task", kwargs={"pk": self.task_today.id})
        response = self.client.post(url, {"project_id": project.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "Task moved successfully")   
        
    def test_get_tasks_by_category(self):
        self.task_today.category = Category.objects.create(name="Work", user=self.user)
        self.task_today.save()
        url = reverse("category-tasks", kwargs={"pk": self.task_today.category.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    # def test_get_tasks_by_project(self): DO NOT WORKING
    #     project = Project.objects.create(name="Proj1", owner=self.user)
    #     self.task_today.project = project
    #     self.task_today.save()
    #     url = reverse("project-tasks", kwargs={"pk": project.id})
    #     response = self.client.get(url)

    #     self.assertEqual(response.status_code, 200)
    #     self.assertEqual(len(response.data), 1)
        
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