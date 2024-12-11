from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

class HelloWorldTest(APITestCase):
    def test_hello_world(self):
        """
        Test to verify that the 'hello_world' API returns the correct response
        """
        url = reverse('hello_world')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "Hello, World!"})
