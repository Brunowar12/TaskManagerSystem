import logging
from datetime import timedelta
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from .test_setup import APITestSetup
from .utils import TestHelper

logger = logging.getLogger(__name__)

class SecurityTests(APITestSetup):
    def setUp(self):
        super().setUp()
        self.other_user, self.other_user_token, self.refresh = TestHelper.create_test_user(
            self.client, email="otheruser@example.com"
        )

    def test_sql_injection(self):
        malicious_input = "' OR '1'='1"
        response = self.client.post(reverse("task-create"), {
            "title": malicious_input,
            "due_date": "2024-12-31T00:00:00Z"
        })

        logger.info(f"SQL Injection Test - Response Status Code: {response.status_code}")
        self.assertNotEqual(
            response.status_code,
            200,
            "API vulnerable to SQL injection"
        )
        self.assertNotEqual(response.status_code, status.HTTP_200_OK, "API vulnerable to SQL injection")
        self.assertNotIn(malicious_input, response.data.get("title", ""), "SQL injection not prevented")

    def test_unauthorized_access(self):
        """Check access to protected resources without authorization"""        
        self.client.credentials()
        response = self.client.get(reverse("task-list"))
        logger.info(f"Unauthorized Access Test - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, 401, "Access without token should be denied")

    def test_access_other_user_resources(self):
        """Check access to another user's tasks"""

        # Крок 1: Створити задачу від імені першого користувача
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        user_task = self.client.post(reverse("task-create"), {
            "title": "User Task",
            "due_date": "2024-12-31T00:00:00Z"
        }).data
        self.assertIn("id", user_task, "Task creation failed")

        # Крок 2: Спробувати отримати доступ до задачі як інший користувач
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_user_token}")
        response_get = self.client.get(reverse("task-detail", kwargs={"pk": user_task["id"]}))
        logger.info(f"Access Other User Resources Test - GET Response Status Code: {response_get.status_code}")
        self.assertEqual(response_get.status_code, 404, "Should not access other user's task")

    def test_xss_prevention(self):
        """Check for protection against XSS attacks"""
        malicious_input = '<script>alert("XSS")</script>'
        response = self.client.post(reverse("task-create"), {
            "title": malicious_input,
            "due_date": "2024-12-31T00:00:00Z"
        })
        logger.info(f"XSS Prevention Test - Response Status Code: {response.status_code}")
        self.assertNotIn(malicious_input, response.data.get("title", ""), "XSS attack not sanitized")
        
        if task_id := response.data.get("id"):
            response = self.client.get(reverse("task-detail", kwargs={"pk": task_id}))
            logger.info(f"XSS Prevention Test - Task Detail Response Status Code: {response.status_code}")
            self.assertNotIn(malicious_input, response.data.get("title", ""), "XSS attack not sanitized")

    # def test_rate_limiting(self) """Checking the number of requests limit"""

    def test_http_methods_security(self):
        """Checking the unavailability of prohibited HTTP methods"""
        response = self.client.put(reverse("task-list"))
        logger.info(f"HTTP Methods Security Test (PUT) - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, 405, "PUT method should not be allowed on task-list")

        response = self.client.post(reverse("task-list"))
        logger.info(f"HTTP Methods Security Test (POST) - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, 405, "POST method should not be allowed on task-list")

        response = self.client.delete(reverse("task-list"))
        logger.info(f"HTTP Methods Security Test (DELETE) - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, 405, "DELETE method should not be allowed on task-list")

    def test_large_payload(self):
        """Check the input data length limit"""
        large_input = "A" * 10000  # Very long string
        response = self.client.post(reverse("task-create"), {
            "title": large_input,
            "due_date": "2024-12-31T00:00:00Z"
        })
        logger.info(f"Large Payload Test - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, 400, "Large input should be rejected")
        self.assertIn("title", response.data, "Error message should include 'title' field")

    def test_nonexistent_endpoint(self):
        """Checking the response to a request for a non-existent route"""
        response = self.client.get("/nonexistent-endpoint/")
        logger.info(f"Nonexistent Endpoint Test - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, 404, "Nonexistent endpoint should return 404")

    def test_invalid_json_payload(self):
        """Check for incorrect JSON processing"""
        response = self.client.post(reverse("task-create"), data="Invalid JSON", content_type="application/json")
        logger.info(f"Invalid JSON Payload Test - Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, 400, "Invalid JSON payload should return 400")
        self.assertIn("detail", response.data, "Error message should include 'detail' field")

    def test_expired_token_manually(self):
        """Create an expired token and test"""
        # Генеруємо токен з минулим терміном дії
        token = AccessToken()
        token.set_exp(lifetime=-timedelta(seconds=1))  # Закінчився на 1 секунду раніше
        expired_token = str(token)

        # Використовуємо недійсний токен
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {expired_token}")
        response = self.client.get(reverse("task-list"))

        # Перевіряємо статус
        self.assertEqual(response.status_code, 401, "Expired token should not be accepted")
        self.assertIn("detail", response.data, "Error message should include 'detail' field")

    def test_revoked_refresh_token(self):
        """Test using a revoked refresh token"""
        response = self.client.post(reverse("login"), {
            "email": self.user.email,
            "password": "testpassword123"
        })
        refresh_token = response.data.get("refresh")  # Отримати REFRESH токен
        logger.info(f"Revoked Token Test - Refresh Token: {refresh_token}")

        self.client.post(reverse("logout"), {"refresh": refresh_token})
        logger.info("Revoked Token Test - Refresh token has been revoked.")

        response = self.client.post(reverse("token_refresh"), {"refresh": refresh_token})
        logger.info(f"Revoked Token Test - Response Status Code: {response.status_code}")

        self.assertEqual(response.status_code, 401, "Revoked refresh token should not be accepted")
        self.assertIn("detail", response.data, "Error should include 'detail' field")
        self.assertEqual(response.data["detail"], "Token is blacklisted", "Error message should indicate token is blacklisted")