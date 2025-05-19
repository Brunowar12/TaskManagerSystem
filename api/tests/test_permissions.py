from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIRequestFactory

from api.tests.utils import TestHelper
from projects.models import Role, Project, ProjectMembership
from projects.permissions import IsProjectAdmin, IsProjectMinRole

from .test_setup import BaseAPITestCase


class PermissionTests(BaseAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.another_user, cls.another_token, _ = (
            TestHelper.create_test_user_via_orm(
                email="otheruser@example.com", password="otherpassword123"
            )
        )

    def setUp(self):
        super().setUp()
        self.admin_role = self.get_or_create_role("Admin")
        self.project = self.create_project_with_membership(
            "PermProj", self.user, self.admin_role
        )

    # === DRY Helpers ===

    def get_or_create_role(self, name):
        return Role.objects.get_or_create(name=name)[0]

    def create_project_with_membership(self, name, user, role):
        project = Project.objects.create(name=name, owner=user)
        ProjectMembership.objects.create(user=user, project=project, role=role)
        return project

    def create_request(self, user):
        request = APIRequestFactory().get("/")
        request.user = user
        return request

    # === Tests ===

    def test_is_project_admin_permission(self):
        viewer_role = self.get_or_create_role("Viewer")
        ProjectMembership.objects.create(
            user=self.another_user, project=self.project, role=viewer_role
        )#

        url = reverse("project-assign-role", kwargs={"pk": self.project.id})
        data = {"user_id": self.another_user.id, "role_id": self.admin_role.id}
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK, "Admin role assignment failed")

        membership = ProjectMembership.objects.get(
            user=self.another_user, project=self.project
        )
        self.assertEqual(membership.role, self.admin_role, "Role assignment did not match")

    def test_is_project_admin_permission_granted(self):
        project = self.create_project_with_membership("X", self.user, self.admin_role)
        permission = IsProjectAdmin()
        request = self.create_request(self.user)
        self.assertTrue(permission.has_object_permission(request, None, project))

    def test_is_project_admin_permission_denied(self):
        project = self.create_project_with_membership("X", self.user, self.admin_role)
        permission = IsProjectAdmin()
        request = self.create_request(self.another_user)
        self.assertFalse(permission.has_object_permission(request, None, project))

    def test_is_project_admin_grants_for_owner(self):
        permission = IsProjectAdmin()
        request = self.create_request(self.user)
        self.assertTrue(permission.has_object_permission(request, None, self.project))

    def test_is_project_admin_denies_for_member(self):
        permission = IsProjectMinRole('Member')
        request = self.create_request(self.another_user)
        self.assertFalse(permission.has_object_permission(request, None, self.project))
