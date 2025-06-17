from datetime import timedelta
from django.urls import reverse
from django.utils.timezone import now
from rest_framework import status

from projects.models import Project
from tasks.models import Task, Category

from .test_setup import BaseAPITestCase
from .utils import TestHelper


class TaskAPITests(BaseAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.task_list = Task.objects.bulk_create(
            [
                Task(
                    title="Simple Task",
                    due_date=TestHelper.get_valid_due_date(0),
                    user=cls.user,
                    is_favorite=False,
                    priority="M",
                ),
                Task(
                    title="Today Task",
                    due_date=TestHelper.get_valid_due_date(0),
                    user=cls.user,
                    is_favorite=True,
                    priority="H",
                ),
                Task(
                    title="Future Task",
                    due_date=TestHelper.get_valid_due_date(),
                    user=cls.user,
                    is_favorite=False,
                    priority="L",
                ),
            ]
        )

        cls.task = cls.task_list[0]
        cls.today_task = cls.task_list[1]
        cls.future_task = cls.task_list[2]

    def setUp(self):
        super().setUp()
        self.task_today = None

    # crud

    def test_task_creation(self):
        task_data = {
            "title": "Test Task",
            "due_date": TestHelper.get_valid_due_date(),
        }
        response = self.api_post(self.task_list_ep, task_data)

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            "Task creation failed",
        )
        self.assertEqual(
            response.data["title"], task_data["title"], "Task title mismatch"
        )
        self.assertEqual(
            response.data["user"], self.user.id, "Task user mismatch"
        )

    def test_task_creation_invalid_due_date(self):
        task_data = {"title": "Test Task", "due_date": "invalid-date"}
        response = self.api_post(self.task_list_ep, task_data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Invalid due date registration did not fail",
        )
        self.assertIn(
            "due_date",
            response.data,
            "Due date validation error not included in response",
        )

    def test_task_creation_missing_title(self):
        task_data = {"due_date": TestHelper.get_valid_due_date()}
        response = self.api_post(self.task_list_ep, task_data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Task creation without title did not fail",
        )
        self.assertIn(
            "title",
            response.data,
            "Title validation error not included in response",
        )

    def test_task_creation_missing_due_date(self):
        task_data = {"title": "Test Task"}
        response = self.api_post(self.task_list_ep, task_data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Task creation without due date did not fail",
        )
        self.assertIn(
            "due_date",
            response.data,
            "Due date validation error not included in response",
        )

    def test_task_creation_unauthenticated(self):
        task_data = {
            "title": "Test Task",
            "due_date": TestHelper.get_valid_due_date(),
        }
        self.client.credentials()
        response = self.client.post(self.task_list_ep, task_data)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
            "Unauthenticated task creation did not fail",
        )
        self.assertIn(
            "Authentication credentials were not provided",
            response.data.get("detail", ""),
            "Authentication error not included in response",
        )

    def test_task_update(self):
        url = reverse("task-detail", kwargs={"pk": self.task.id})
        response = self.client.patch(url, {"title": "Updated Task"})

        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Task update failed"
        )
        self.assertEqual(
            response.data["title"], "Updated Task", "Task title not updated"
        )

    def test_task_update_unauthenticated(self):
        url = reverse("task-detail", kwargs={"pk": self.task.id})
        self.client.credentials()
        response = self.client.patch(url, {"title": "Updated Task"})

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
            "Unauthenticated task update did not fail",
        )
        self.assertIn(
            "Authentication credentials were not provided",
            response.data.get("detail", ""),
            "Authentication error not included in response",
        )

    def test_task_deletion(self):
        url = reverse("task-detail", kwargs={"pk": self.task.id})
        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
            "Task deletion failed",
        )
        response = self.client.get(url)
        self.assertEqual(
            response.status_code, status.HTTP_404_NOT_FOUND, "Task not deleted"
        )

    def test_task_deletion_unauthenticated(self):
        url = reverse("task-detail", kwargs={"pk": self.task.id})
        self.client.credentials()
        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
            "Unauthenticated task deletion did not fail",
        )
        self.assertIn(
            "Authentication credentials were not provided",
            response.data.get("detail", ""),
            "Authentication error not included in response",
        )

    def test_task_deletion_unauthorized(self):
        # Creating task with one user
        task = self.api_post(
            self.task_list_ep, {
                "title": "Task to Delete",
                "due_date": TestHelper.get_valid_due_date(),
            }).data
        task_id = task["id"]

        # Trying to delete the task as another user
        _, other_token, _ = TestHelper.create_test_user(
            self.client, email="otheruser@example.com"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token}")
        url = reverse("task-detail", kwargs={"pk": task_id})
        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
            "Unauthorized user was able to delete task",
        )

    def test_task_detail_invalid_id(self):
        response = self.client.get(reverse("task-detail", kwargs={"pk": 999}))
        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Invalid task ID did not return 404",
        )

    # management

    def test_task_queryset_only_user_tasks(self):
        _, other_token, _ = TestHelper.create_test_user(
            self.client, email="another@example.com"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token}")
        self.api_post(
            self.task_list_ep, {
                "title": "Other Task",
                "due_date": TestHelper.get_valid_due_date(),
            })

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(self.task_list_ep)
        self.assertTrue(
            all(
                task["user"] == self.user.id
                for task in response.data["results"]
            )
        )

    def test_toggle_favorite(self):
        url = reverse("task-toggle-favorite", kwargs={"pk": self.today_task.id})
        response = self.api_post(url, data={})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["is_favorite"], not self.today_task.is_favorite)

    def test_toggle_completed(self):
        url = reverse("task-toggle-completed", kwargs={"pk": self.future_task.id})
        response = self.api_post(url, data={})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("completed_at", response.data)

    def test_task_mark_completed_twice(self):
        task = self.api_post(
            self.task_list_ep,
            {
                "title": "Task To Complete",
                "due_date": TestHelper.get_valid_due_date(),
                "completed": True,
            },
        ).data
        task_id = task["id"]

        # Initially mark as completed
        url = reverse("task-toggle-completed", kwargs={"pk": task_id})
        response = self.api_post(url, data={})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        completed_at = response.data["completed_at"]

        # Toggle completed status again
        response = self.api_post(url, data={})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(
            response.data["completed_at"],
            completed_at,
            "Completed at date should be updated",
        )

    def test_completed_at_updated_correctly(self):
        task = self.api_post(
            self.task_list_ep,
            {
                "title": "Auto Complete",
                "due_date": TestHelper.get_valid_due_date(),
                "completed": True,
            },
        ).data
        detail = self.client.get(
            reverse("task-detail", kwargs={"pk": task["id"]})
        ).data
        self.assertIsNotNone(detail["completed_at"], "Completed at not set")

    def test_task_str_representation(self):
        task = self.today_task
        self.assertIn(task.title, str(task))
        self.assertIn(self.user.username, str(task))

    def test_move_task_to_project(self):
        project = Project.objects.create(name="Move Project", owner=self.user)
        url = reverse("task-move-task", kwargs={"pk": self.task.id})
        response = self.api_post(url, {"project_id": project.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "Task moved successfully")

    def test_get_tasks_by_category(self):
        self.today_task.category = Category.objects.create(
            name="Work", user=self.user
        )
        self.today_task.save()
        url = reverse(
            "category-tasks", kwargs={"pk": self.today_task.category.id}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_tasks_by_project(self):
        project = Project.objects.create(name="Proj1", owner=self.user)
        self.task_today = Task.objects.create(
            title="Today Task", project=project, user=self.user,
            due_date="2025-05-07", priority="M", completed=False
        )
        url = reverse("project-tasks-list", kwargs={"project_pk": project.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 1)
        self.assertEqual(response.data.get('results', [])[0].get('title'), 'Today Task')

    def test_task_today_action(self):
        response = self.client.get(self.task_today_ep)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            any("Today" in task["title"] for task in response.data)
        )

    def test_task_favorites_action(self):
        response = self.client.get(self.task_favorites_ep)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(task["is_favorite"] for task in response.data))

    # filtering

    def test_filter_by_status(self):
        self.today_task.completed = False
        self.today_task.save()

        self.future_task.completed = True
        self.future_task.save()

        response = self.client.get(self.task_list_ep, {"completed": "True"})

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Filtering by status does not work",
        )
        self.assertEqual(
            len(response.data.get("results", [])),
            1,
            "Incorrect number of tasks",
        )
        self.assertTrue(
            response.data["results"][0]["completed"], "Incorrect task returned"
        )

    def test_filter_by_priority(self):
        self.task.priority = "M"
        self.task.save()

        self.future_task.priority = "L"
        self.future_task.save()

        response = self.client.get(self.task_list_ep, {"priority": "M"})

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Filtering by priority does not work",
        )
        self.assertEqual(
            len(response.data.get("results", [])),
            1,
            "Incorrect number of tasks",
        )
        self.assertEqual(
            response.data["results"][0]["priority"],
            "M",
            "Incorrect task returned",
        )

    def test_filter_by_today(self):
        self.task.due_date = now()
        self.task.save()

        self.future_task.due_date = now() + timedelta(days=1)
        self.future_task.save()

        self.today_task.due_date = now() + timedelta(days=2)
        self.today_task.save()

        response = self.client.get(self.task_list_ep, {"today": "true"})

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Filtering by today does not work",
        )
        self.assertEqual(
            len(response.data.get("results", [])),
            1,
            "Incorrect number of tasks",
        )
        self.assertEqual(
            response.data["results"][0]["due_date"].split("T")[0],
            now().date().isoformat(),
            "Incorrect date of the task",
        )

    def test_combined_filters(self):
        self.today_task.priority = "H"
        self.today_task.save()

        response = self.client.get(
            self.task_list_ep, {"search": "Today", "priority": "H"}
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Filtering with a combination of parameters does not work",
        )
        self.assertEqual(
            len(response.data.get("results", [])),
            1,
            "Incorrect number of tasks",
        )
        self.assertEqual(
            response.data["results"][0]["title"],
            "Today Task",
            "Incorrect task returned",
        )

    def test_sorting_by_title(self):
        response = self.client.get(self.task_list_ep, {"ordering": "title"})

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Sorting by title does not work",
        )
        titles = [task["title"] for task in response.data.get("results", [])]
        expected_titles = sorted(
            [self.today_task.title, self.future_task.title, self.task.title]
        )
        self.assertEqual(
            titles, expected_titles, "Tasks are not sorted correctly by title"
        )
