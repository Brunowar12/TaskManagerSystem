from typing import Optional
from django.urls import reverse
from rest_framework.test import APITestCase
from .utils import TestHelper

class BaseAPITestCase(APITestCase):
    """
    Base class for API test cases with shared setup and utility methods

    Attributes:
        user (User): Test user
        token (str): Access token
        refresh (str): Refresh token
        .._eps (endpoints): (str): URLs for corresponding API endpoints

    Methods:
        setUpTestData(): Set up initial test data
        setUp(): Configure test client
        api_post(): Make authenticated POST request
    """

    @classmethod
    def setUpTestData(cls):
        cls.user, cls.token, cls.refresh = TestHelper.create_test_user_via_orm()
        cls.category_list_ep = reverse("category-list")
        cls.task_list_ep = reverse("task-list")
        cls.task_today_ep = reverse("task-today")
        cls.task_favorites_ep = reverse("task-favorites")
        cls.token_refresh_ep = reverse("token_refresh")
        cls.user_login_ep = reverse("auth-login")
        cls.user_logout_ep = reverse("auth-logout")
        cls.user_profile_ep = reverse("user-profile")
        cls.user_register_ep = reverse("auth-register")
        cls.user_update_profile_ep = reverse("user-update-profile")
        cls.project_list_ep = reverse("project-list")
        cls.role_list_ep = reverse("role-list")

    def setUp(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def api_post(self, endpoint: str, data: dict, token: Optional[str] = None):
        return self.client.post(
            endpoint, data, format="json",
            HTTP_AUTHORIZATION=f"Bearer {token or getattr(self, 'token', '')}"
        )
