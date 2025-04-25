from datetime import timedelta
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken

from .test_setup import BaseAPITestCase
from .utils import TestHelper


class SecurityTests(BaseAPITestCase):
    """Tests for security measures"""

    def setUp(self):
        super().setUp()
        self.other_user, self.other_user_token, _ = (
            TestHelper.create_test_user_via_orm(
                email="other@example.com", password="otherpassword123"
            )
        )

    def test_unauthorized_access(self):
        """Check access to protected resources without authorization"""
        self.client.credentials()
        response = self.client.get(self.task_list_ep)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
            "Access without token should be denied",
        )

    def test_invalid_json_payload(self):
        """Check for incorrect JSON processing"""
        response = self.client.post(
            self.task_list_ep,
            data="Invalid JSON",
            content_type="application/json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Invalid JSON payload should return 400",
        )
        self.assertIn(
            "detail",
            response.json(),
            "Error message should include 'detail' field",
        )

    def test_large_payload_rejected(self):
        """Payload exceeding the size limit should return 413 Payload Too Large"""
        large_data = {
            "title": "X" * (1024 * 1024 * 25 + 1),
            "due_date": TestHelper.get_valid_due_date(),
        }
        response = self.api_post(self.task_list_ep, large_data)

        self.assertEqual(
            response.status_code,
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            "Payload exceeding the limit should return 413 Payload Too Large",
        )

    def test_nonexistent_endpoint(self):
        """Checking the response to a request for a non-existent route"""
        response = self.client.get("/nonexistent-endpoint/")

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Nonexistent endpoint should return 404",
        )

    def test_sql_injection(self):
        """SQL injection attempts should be rejected with 400 Bad Request"""
        malicious_input = "'; DROP TABLE tasks_task; --"
        response = self.api_post(self.task_list_ep, {
            "title": malicious_input, 
            "due_date": TestHelper.get_valid_due_date()
        })

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "SQL injection payload should be rejected with 400 Bad Request",
        )
        self.assertIn(
            "title",
            response.json(),
            "Error response should include validation error for 'title'",
        )

    def test_xss_prevention(self):
        """Check for protection against XSS attacks"""
        malicious_input = '<script>alert("XSS")</script>'
        response = self.api_post(
            self.task_list_ep, {
                "title": malicious_input,
                "due_date": TestHelper.get_valid_due_date(),
        })
        data_json = response.json()
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "XSS payload should be rejected by validation",
        )
        
        title = data_json.get("title")
        self.assertNotIn(
            "<script>",
            title,
            "Title should have scripts stripped out"
        )

        task_id = data_json.get("id")
        if task_id:
            response = self.client.get(
                reverse("task-detail", kwargs={"pk": task_id})
            )
            self.assertNotIn(
                "<script>",
                response.json().get("title"),
                "Retrieved title should be sanitized as well"
            )

    def test_http_methods_security(self):
        """Checking the unavailability of prohibited HTTP methods"""
        for method in ("put", "delete", "patch"):
            response = getattr(self.client, method)(self.task_list_ep)
            self.assertEqual(
                response.status_code,
                status.HTTP_405_METHOD_NOT_ALLOWED,
                f"{method.upper()} on task-list should return 405 Method Not Allowed",
            )

    def test_expired_token(self):
        """Create an expired token and test"""
        token = AccessToken()
        token.set_exp(lifetime=-timedelta(seconds=1))

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(token)}")

        response = self.client.get(self.task_list_ep)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
            "Expired access token should be rejected (401 Unauthorized)",
        )
        self.assertIn(
            "detail",
            response.json(),
            "Error response should include 'detail' field",
        )

    def test_revoked_refresh_token(self):
        """A revoked refresh token should not be accepted by token refresh endpoint"""
        from json import dumps as jdumps
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(self.user)

        # Revoke via logout endpoint
        self.client.post(
            self.user_logout_ep,
            data=jdumps({"refresh": str(refresh)}),
            content_type="application/json",
        )

        # Attempt to refresh using revoked token
        response = self.client.post(
            self.token_refresh_ep,
            data=jdumps({"refresh": str(refresh)}),
            content_type="application/json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
            "Revoked refresh token should be rejected (401 Unauthorized)",
        )
        self.assertEqual(
            response.json().get("detail"),
            "Token is blacklisted",
            "Error message should indicate the token is blacklisted",
        )

    def test_access_other_user_resources(self):
        """Users should not access tasks belonging to other users"""

        # Create a task as the original user
        task = self.api_post(self.task_list_ep, {
                "title": "User Task",
                "due_date": TestHelper.get_valid_due_date()
            }).json()
        self.assertIn("id", task, "Task should be successfully created")

        # Attempt to GET the task with another user's token
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.other_user_token}"
        )
        response = self.client.get(
            reverse("task-detail", kwargs={"pk": task["id"]})
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Should not access tasks of other users (404 Not Found)",
        )
