from django.urls import reverse
from rest_framework import status
from tasks.models import Role, Project, ProjectMembership
from .test_setup import BaseAPITestCase

class PermissionTests(BaseAPITestCase):
    def test_is_project_admin_permission(self):
        role = Role.objects.create(name="Admin")
        project = Project.objects.create(name="Test Project", owner=self.user)
        ProjectMembership.objects.create(user=self.user, project=project, role=role)

        url = reverse("project-assign-role", kwargs={"pk": project.id})
        data = {"user_id": self.user.id, "role_id": role.id}
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Admin role assignment failed")
        
        membership = ProjectMembership.objects.get(user=self.user, project=project)
        self.assertEqual(membership.role, role, "Role assignment did not match")
