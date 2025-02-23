from rest_framework.test import APITestCase
from api.tests.utils import TestHelper

class BaseAPITestCase(APITestCase):
    """
    A base class for testing the API that creates a user and establishes authorization
    """
    def setUp(self):
        self.user, self.token, self.refresh = TestHelper.create_test_user(self.client)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")