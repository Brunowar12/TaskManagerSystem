from django.urls import reverse
from rest_framework import status

from api.tests.utils import TestHelper
from projects.models import Role, Project, ProjectMembership

from .test_setup import BaseAPITestCase

class PermissionTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.another_user, self.another_token, _ = TestHelper.create_test_user(
            self.client, email="otheruser@example.com", password="otherpassword123"
        )
        self.admin_role = Role.objects.create(name="Admin")
        
    def test_is_project_admin_permission(self):
        project = Project.objects.create(name="Test Project", owner=self.user)
        ProjectMembership.objects.create(user=self.user, project=project, role=self.admin_role)

        url = reverse("project-assign-role", kwargs={"pk": project.id})
        data = {"user_id": self.another_user.id, "role_id": self.admin_role.id}
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Admin role assignment failed")

        membership = ProjectMembership.objects.get(user=self.another_user, project=project)
        self.assertEqual(membership.role, self.admin_role, "Role assignment did not match")
