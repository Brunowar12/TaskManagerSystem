import logging
from datetime import timedelta
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from .test_setup import BaseAPITestCase
from .utils import TestHelper

logger = logging.getLogger(__name__)

class SecurityTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.other_user, self.other_user_token, _ = TestHelper.create_test_user(
            self.client, email="otheruser@example.com"
        )

    def test_sql_injection(self):
        malicious_input = "' OR '1'='1"
        response = self.client.post(
            reverse("task-create"),
            {"title": malicious_input, "due_date": TestHelper.get_valid_due_date()}
        )
        logger.info(f"SQL Injection Test - Response Status Code: {response.status_code}")
        
        self.assertNotEqual(response.status_code, status.HTTP_200_OK, "API vulnerable to SQL injection")
        self.assertNotIn(malicious_input, response.data.get("title", ""), "SQL injection not prevented")

    def test_unauthorized_access(self):
        """Check access to protected resources without authorization"""        
        self.client.credentials()
        response = self.client.get(reverse("task-list"))
        logger.info(f"Unauthorized Access Test - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, "Access without token should be denied")

    def test_access_other_user_resources(self):
        """Check access to another user's tasks"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        user_task = self.client.post(
            reverse("task-create"),
            {"title": "User Task", "due_date": TestHelper.get_valid_due_date()}
        ).data
        self.assertIn("id", user_task, "Task creation failed")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_user_token}")
        response_get = self.client.get(reverse("task-detail", kwargs={"pk": user_task["id"]}))
        logger.info(f"Access Other User Resources Test - GET Response Status Code: {response_get.status_code}")
        self.assertEqual(response_get.status_code, status.HTTP_404_NOT_FOUND, "Should not access other user's task")

    def test_xss_prevention(self):
        """Check for protection against XSS attacks"""
        malicious_input = '<script>alert("XSS")</script>'
        response = self.client.post(
            reverse("task-create"),
            {"title": malicious_input, "due_date": TestHelper.get_valid_due_date()}
        )
        logger.info(f"XSS Prevention Test - Response Status Code: {response.status_code}")
        self.assertNotIn(malicious_input, response.data.get("title", ""), "XSS attack not sanitized")
        
        task_id = response.data.get("id")
        if task_id:
            response = self.client.get(reverse("task-detail", kwargs={"pk": task_id}))
            logger.info(f"XSS Prevention Test - Task Detail Response Status Code: {response.status_code}")
            self.assertNotIn(malicious_input, response.data.get("title", ""), "XSS attack not sanitized")

    # def test_rate_limiting(self) """Checking the number of requests limit"""

    def test_http_methods_security(self):
        """Checking the unavailability of prohibited HTTP methods"""
        for method, expected_status in (("put", 405), ("post", 405), ("delete", 405)):
            response = getattr(self.client, method)(reverse("task-list"))
            logger.info(f"HTTP Methods Security Test ({method.upper()}) - Response Status Code: {response.status_code}")
            self.assertEqual(response.status_code, expected_status, f"{method.upper()} method should not be allowed on task-list")

    def test_large_payload(self):
        """Check the input data length limit"""
        large_input = "A" * 10000  # Very long string
        response = self.client.post(
            reverse("task-create"),
            {"title": large_input, "due_date": TestHelper.get_valid_due_date()}
        )
        logger.info(f"Large Payload Test - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Large input should be rejected")
        self.assertIn("title", response.data, "Error message should include 'title' field")

    def test_nonexistent_endpoint(self):
        """Checking the response to a request for a non-existent route"""
        response = self.client.get("/nonexistent-endpoint/")
        logger.info(f"Nonexistent Endpoint Test - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND, "Nonexistent endpoint should return 404")

    def test_invalid_json_payload(self):
        """Check for incorrect JSON processing"""
        response = self.client.post(
            reverse("task-create"),
            data="Invalid JSON",
            content_type="application/json"
        )
        logger.info(f"Invalid JSON Payload Test - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "Invalid JSON payload should return 400")
        self.assertIn("detail", response.data, "Error message should include 'detail' field")

    def test_expired_token_manually(self):
        """Create an expired token and test"""
        token = AccessToken()
        token.set_exp(lifetime=-timedelta(seconds=1))  # Ended 1 second earlier
        expired_token = str(token)

        # Using an invalid token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {expired_token}")
        response = self.client.get(reverse("task-list"))

        # Check the status
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, "Expired token should not be accepted")
        self.assertIn("detail", response.data, "Error message should include 'detail' field")

    def test_revoked_refresh_token(self):
        """Test using a revoked refresh token"""
        response = self.client.post(reverse("login"), {
            "email": self.user.email,
            "password": "testpassword123"
        })
        refresh_token = response.data.get("refresh")
        logger.info(f"Revoked Token Test - Refresh Token: {refresh_token}")

        self.client.post(reverse("logout"), {"refresh": refresh_token})
        logger.info("Revoked Token Test - Refresh token has been revoked.")

        response = self.client.post(reverse("token_refresh"), {"refresh": refresh_token})
        logger.info(f"Revoked Token Test - Response Status Code: {response.status_code}")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, "Revoked refresh token should not be accepted")
        self.assertIn("detail", response.data, "Error should include 'detail' field")
        self.assertEqual(response.data.get("detail"), "Token is blacklisted", "Error message should indicate token is blacklisted")