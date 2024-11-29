from rest_framework.test import APITestCase
from api.tests.utils import TestHelper

class APITestSetup(APITestCase):
    def setUp(self):
        self.user, self.token, self.refresh = TestHelper.create_test_user(self.client)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")