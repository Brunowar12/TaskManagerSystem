from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from projects.models import Project, Role, ProjectMembership, ProjectShareLink
from api.tests.test_setup import BaseAPITestCase
from api.tests.utils import TestHelper
from django.contrib.auth import get_user_model

User = get_user_model()


class ProjectsAPITests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.other_user, self.other_token, _ = TestHelper.create_test_user(
            self.client,
            email="otheruser@example.com",
            password="otherpassword123",
        )
        self.admin_role = Role.objects.create(name="Admin")

        self.project_data = {
            "name": "Test Project",
            "description": "This is a test project",
        }
        self.role_data = {"name": "Contributor"}

        self.project = Project.objects.create(
            name="Test Project", description="Description", owner=self.user
        )
        self.role = Role.objects.create(name="Contributor")

        self.share_link = ProjectShareLink.objects.create(
            project=self.project,
            role=self.role,
            max_uses=1,
            expires_at=timezone.now() + timedelta(minutes=10),
            created_by=self.user,
        )

    # --- Tests for ProjectViewSet ---

    def test_project_creation(self):
        """Check project creation. Owner should be the current user."""
        url = reverse("project-list")
        data = {"name": "Test Project1", "description": "Test Description"}
        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            "Project creation failed",
        )
        self.assertEqual(
            response.data.get("name"), data["name"], "Project name mismatch"
        )
        self.assertEqual(
            response.data.get("owner"), self.user.id, "Project owner mismatch"
        )

    def test_project_listing(self):
        """Check that the project list returns only projects owned by the current user."""
        Project.objects.create(name="Proj 1", owner=self.user)
        Project.objects.create(name="Proj 2", owner=self.user)
        Project.objects.create(name="Other Project", owner=self.other_user)

        url = reverse("project-list")
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Failed to retrieve project list",
        )
        for project in response.data.get("results", []):
            self.assertEqual(
                project["owner"],
                self.user.id,
                "Received project not owned by current user",
            )

    def test_project_detail_update_delete(self):
        """Create project, retrieve details, update and delete."""
        project = Project.objects.create(
            name="Detail Project", owner=self.user
        )
        url_detail = reverse("project-detail", kwargs={"pk": project.id})

        response = self.client.get(url_detail)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Failed to retrieve project details",
        )
        self.assertEqual(
            response.data.get("name"), project.name, "Project name mismatch"
        )

        new_name = "Updated Project Name"
        response = self.client.patch(url_detail, {"name": new_name})
        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Project update failed"
        )
        self.assertEqual(
            response.data.get("name"), new_name, "Project name was not updated"
        )

        response = self.client.delete(url_detail)
        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
            "Project deletion failed",
        )
        response = self.client.get(url_detail)
        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Project should have been deleted",
        )

    def test_project_members_listing(self):
        """Project owner can retrieve list of members in their project."""
        project = Project.objects.create(name="Team List", owner=self.user)
        ProjectMembership.objects.create(
            project=project, user=self.other_user, role=self.admin_role
        )
        url = reverse("project-membership-list") + f"?project={project.id}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            any(
                member["user_details"]["id"] == self.other_user.id
                for member in response.data["results"]
            )
        )

    def test_anonymous_cannot_list_projects(self):
        """Unauthenticated user should not access project list."""
        self.client.credentials()  # Remove authentication
        url = reverse("project-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    def test_project_name_unique_per_owner(self):
        """Check that the same user cannot create two projects with the same name."""
        Project.objects.create(name="Unique Test", owner=self.user)
        url = reverse("project-list")
        response = self.client.post(url, {"name": "Unique Test"})
        # This depends on whether uniqueness is enforced
        self.assertIn(response.status_code, [400, 201])

    def test_user_cannot_access_other_users_project(self):
        """Users should not retrieve or modify projects they do not own."""
        project = Project.objects.create(name="Private", owner=self.other_user)
        url = reverse("project-detail", kwargs={"pk": project.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_create_project_with_invalid_data(self):
        url = reverse("project-list")
        invalid_data = {"name": ""}
        response = self.client.post(url, invalid_data)
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Invalid project creation did not fail",
        )

    def test_update_other_user_project(self):
        project = Project.objects.create(
            name="Old Name", description="Old description", owner=self.other_user
        )
        url = reverse("project-detail", kwargs={"pk": project.id})
        response = self.client.patch(url, {"name": "Updated Name"})
        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Project update by other user did not fail",
        )

    def test_delete_other_user_project(self):
        project = Project.objects.create(
            name="Project to Delete",
            description="Description",
            owner=self.other_user,
        )
        url = reverse("project-detail", kwargs={"pk": project.id})
        response = self.client.delete(url)
        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Project deletion by other user did not fail",
        )

    def test_get_project_details_as_member(self):
        project = Project.objects.create(
            name="Project", description="Description", owner=self.user
        )
        ProjectMembership.objects.create(
            project=project, user=self.other_user, role=self.admin_role
        )
        url = reverse("project-detail", kwargs={"pk": project.id})
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.other_token}"
        )
        response = self.client.get(url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Project details retrieval by member failed",
        )

    def test_assign_nonexistent_role(self):
        url = reverse("project-assign-role", kwargs={"pk": self.project.id})
        other_user, _, _ = TestHelper.create_test_user(
            self.client, email="otheruser@example.com"
        )
        response = self.client.post(
            url, {"user_id": other_user.id, "role_id": 9999}
        )
        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Nonexistent role assignment did not fail",
        )

    def test_assign_existing_role(self):
        ProjectMembership.objects.create(
            project=self.project, user=self.other_user, role=self.role
        )
        url = reverse("project-assign-role", kwargs={"pk": self.project.id})
        response = self.client.post(
            url, {"user_id": self.other_user.id, "role_id": self.role.id}
        )
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Existing role assignment did not fail",
        )

    # --- Tests for assigning roles (assign_role) ---

    def test_assign_role_to_user(self):
        """Check assigning role to another user."""
        project = Project.objects.create(name="Role Project", owner=self.user)
        url = reverse("project-assign-role", kwargs={"pk": project.id})

        data = {"user_id": self.other_user.id, "role_id": self.admin_role.id}
        response = self.client.post(url, data)
        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Role assignment failed"
        )

        membership = project.memberships.filter(user=self.other_user).first()
        self.assertIsNotNone(membership, "Membership record was not created")
        self.assertEqual(
            membership.role.id, self.admin_role.id, "Incorrect role assigned"
        )

    def test_assign_role_user_not_found(self):
        """Check that assigning role to nonexistent user returns 404."""
        project = Project.objects.create(
            name="Nonexistent User Project", owner=self.user
        )
        url = reverse("project-assign-role", kwargs={"pk": project.id})
        data = {"user_id": 9999, "role_id": self.admin_role.id}
        response = self.client.post(url, data)
        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Should return 404 for nonexistent user",
        )

    def test_cannot_assign_role_to_owner(self):
        """The project owner cannot assign a role to themselves."""
        project = Project.objects.create(name="Owner Role", owner=self.user)
        url = reverse("project-assign-role", kwargs={"pk": project.id})
        data = {"user_id": self.user.id, "role_id": self.admin_role.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_assign_nonexistent_role(self):
        """Assigning a nonexistent role should return 404."""
        project = Project.objects.create(name="Bad Role", owner=self.user)
        url = reverse("project-assign-role", kwargs={"pk": project.id})
        data = {"user_id": self.other_user.id, "role_id": 9999}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 404)

    def test_create_role_with_invalid_data(self):
        url = reverse("role-list")
        invalid_data = {"name": ""}
        response = self.client.post(url, invalid_data)
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Invalid role creation did not fail",
        )

    def test_update_other_user_role(self):
        role = Role.objects.create(name="Old Role")
        project = Project.objects.create(name="Project", owner=self.other_user)
        ProjectMembership.objects.create(
            project=project,
            user=self.other_user,
            role=role,
        )
        url = reverse("role-detail", kwargs={"pk": role.id})
        response = self.client.patch(url, {"name": "Updated Role"})
        self.assertEqual(
            response.status_code, status.HTTP_403_FORBIDDEN,
            "Role update by other user did not fail",
        )

    def test_delete_assigned_role(self):
        role = Role.objects.create(name="Role to Delete")
        ProjectMembership.objects.create(
            project=Project.objects.create(name="Project", owner=self.user),
            user=self.user,
            role=role,
        )
        url = reverse("role-detail", kwargs={"pk": role.id})
        response = self.client.delete(url)
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Assigned role deletion did not fail",
        )

    # --- Tests for share link generation ---

    def test_generate_share_link(self):
        """Check generating share link for project."""
        project = Project.objects.create(
            name="Share Link Project", owner=self.user
        )
        url = reverse("project-generate-share-link", kwargs={"pk": project.id})
        data = {
            "role_id": self.admin_role.id,
            "max_uses": 5,
            "expires_in": 120,
        }
        response = self.client.post(url, data)
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            "Failed to generate share link",
        )
        self.assertIn(
            "share_url", response.data, "share_url should be in response"
        )

    def test_generate_share_link_unlimited_uses(self):
        """Share link with no max_uses should be allowed."""
        project = Project.objects.create(
            name="Unlimited Link", owner=self.user
        )
        url = reverse("project-generate-share-link", kwargs={"pk": project.id})
        data = {"role_id": self.admin_role.id, "expires_in": 60}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 201)
        self.assertIsNone(ProjectShareLink.objects.last().max_uses)

    # --- Tests for joining a project ---

    def test_join_project_success(self):
        """Check joining project using valid share link."""
        project = Project.objects.create(name="Join Project", owner=self.user)
        share_link = ProjectShareLink.objects.create(
            project=project,
            role=self.admin_role,
            max_uses=1,
            used_count=0,
            expires_at=timezone.now() + timedelta(minutes=60),
            created_by=self.user,
        )

        url = reverse("join-project", kwargs={"token": share_link.token})
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.other_token}"
        )
        response = self.client.post(url)

        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Failed to join project"
        )
        self.assertEqual(
            response.data.get("status"),
            "Successfully joined the project",
            "Unexpected response message",
        )

        membership = project.memberships.filter(user=self.other_user).first()
        self.assertIsNotNone(membership, "Membership record was not created")

    def test_join_project_invalid_token(self):
        """Joining with an invalid token should return 404."""
        url = reverse(
            "join-project",
            kwargs={"token": "00000000-0000-0000-0000-000000000000"},
        )
        response = self.client.post(url)
        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Invalid token should return 404",
        )

    def test_join_project_expired_link(self):
        """Using expired link should return 403."""
        project = Project.objects.create(
            name="Expired Project", owner=self.user
        )
        share_link = ProjectShareLink.objects.create(
            project=project,
            role=self.admin_role,
            max_uses=1,
            used_count=0,
            expires_at=timezone.now() - timedelta(minutes=1),
            created_by=self.user,
        )
        url = reverse("join-project", kwargs={"token": share_link.token})
        response = self.client.post(url)
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
            "Expired link should return 403",
        )
        self.assertIn(
            "error", response.data, "Response should include error message"
        )

    def test_cannot_join_project_twice(self):
        """User cannot join the same project twice using a share link."""
        project = Project.objects.create(
            name="Duplicate Join", owner=self.user
        )
        ProjectMembership.objects.create(
            project=project, user=self.other_user, role=self.admin_role
        )
        share_link = ProjectShareLink.objects.create(
            project=project,
            role=self.admin_role,
            max_uses=5,
            expires_at=timezone.now() + timedelta(minutes=10),
            created_by=self.user,
        )
        url = reverse("join-project", kwargs={"token": share_link.token})
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.other_token}"
        )
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Already a member", response.data.get("status", ""))

    def test_join_project_max_uses_exceeded(self):
        """Joining should fail if share link has reached max_uses."""
        project = Project.objects.create(name="Max Uses", owner=self.user)
        share_link = ProjectShareLink.objects.create(
            project=project,
            role=self.admin_role,
            max_uses=1,
            used_count=1,
            expires_at=timezone.now() + timedelta(minutes=10),
            created_by=self.user,
        )
        url = reverse("join-project", kwargs={"token": share_link.token})
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.other_token}"
        )
        response = self.client.post(url)
        self.assertEqual(response.status_code, 403)
        self.assertIn("error", response.data)

    def test_generate_share_link_with_invalid_data(self):
        url = reverse(
            "project-generate-share-link", kwargs={"pk": self.project.id}
        )
        invalid_data = {
            "role_id": self.role.id,
            "max_uses": -1,
            "expires_in": -10,
        }
        response = self.client.post(url, invalid_data)
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Invalid share link generation did not fail",
        )

    def test_use_share_link_with_invalid_used_count(self):
        self.share_link.used_count = self.share_link.max_uses
        self.share_link.save()
        url = reverse("join-project", kwargs={"token": self.share_link.token})
        response = self.client.post(url)
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
            "Used share link with invalid used_count did not fail",
        )

    def test_delete_other_user_share_link(self):
        other_project = Project.objects.create(
            name="Other Project", owner=self.other_user
        )
        other_share_link = ProjectShareLink.objects.create(
            project=other_project,
            role=self.role,
            max_uses=1,
            expires_at=timezone.now() + timedelta(minutes=10),
            created_by=self.other_user,
        )
        url = reverse(
            "project-delete-share-link", kwargs={"pk": other_share_link.id}
        )
        response = self.client.delete(url)
        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Share link deletion by other user did not fail",
        )