from datetime import timedelta
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from projects.models import Project, Role, ProjectMembership, ProjectShareLink
from projects.serializers import ProjectMembershipSerializer, ProjectSerializer

from .test_setup import BaseAPITestCase
from .utils import TestHelper

User = get_user_model()

FIXED_ROLES = ["Admin", "Moderator", "Member", "Viewer"]

class ProjectsAPITests(BaseAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.other_user, cls.other_token, _ = cls.create_user(
            "otheruser@example.com", "otherpassword123"
        )

    @classmethod
    def create_user(cls, email, password):
        return TestHelper.create_test_user_via_orm(
            email=email, password=password
        )

    @classmethod
    def create_role(cls, name):
        assert name in FIXED_ROLES, f"Role '{name}' is not fixed"
        return Role.objects.get_or_create(name=name)[0]

    @classmethod
    def create_project(cls, name="Test Project", owner=None):
        return Project.objects.create(name=name, owner=owner or cls.user)

    @classmethod
    def create_membership(cls, project, user, role_name="Member"):
        role = cls.create_role(name=role_name)
        return ProjectMembership.objects.create(
            project=project, user=user, role=role
        )

    @classmethod
    def create_share_link(
        cls, project, role=None, created_by=None,
        max_uses=3, used_count=0, expires_in=5,
    ):
        role = role or cls.create_role("Admin")
        return ProjectShareLink.objects.create(
            project=project,
            role=role,
            max_uses=max_uses,
            used_count=used_count,
            expires_at=timezone.now() + timedelta(minutes=expires_in),
            created_by=created_by or cls.user,
        )

    def api_get(self, url, token=None):
        return self.client.get(
            url, HTTP_AUTHORIZATION=f"Bearer {token or self.token}"
        )

    def api_patch(self, url, data, token=None):
        return self.client.patch(
            url,
            data,
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token or self.token}",
        )

    def api_delete(self, url, token=None):
        return self.client.delete(
            url, HTTP_AUTHORIZATION=f"Bearer {token or self.token}"
        )


class ProjectsAPICrudTests(ProjectsAPITests):
    def test_project_creation(self):
        data = {"name": "Proj1", "description": "Desc"}
        response = self.api_post(self.project_list_ep, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], data["name"])
        self.assertEqual(response.data["owner"], self.user.id)

    def test_list_only_owned(self):
        other = self.create_project(name="Oth", owner=self.other_user)
        mine = self.create_project(name="Mine", owner=self.user)
        response = self.api_get(self.project_list_ep)
        
        ids = {p["id"] for p in response.data["results"]}
        self.assertIn(mine.id, ids)
        self.assertNotIn(other.id, ids)

    def test_detail_update_delete(self):
        project = self.create_project(name="DWR", owner=self.user)
        url = reverse("project-detail", kwargs={"pk": project.id})
        
        self.assertEqual(self.api_get(url).status_code, status.HTTP_200_OK)
        self.assertEqual(self.api_patch(url, {"name": "XYZ"}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.api_delete(url).status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.api_get(url).status_code, status.HTTP_404_NOT_FOUND)

    def test_create_project_empty_name(self):
        response = self.api_post(self.project_list_ep, {"name": "", "description": "X"})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_create_project_unauthenticated(self):
        self.client.credentials()
        response = self.client.post(
            self.project_list_ep, {"name": "Abc", "description": "B"}
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_delete_not_owner_forbidden(self):
        project = self.create_project(name="P", owner=self.other_user)
        url = reverse("project-detail", kwargs={"pk": project.id})
        self.assertEqual(self.api_patch(url, {"description": "New"}).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.api_delete(url).status_code, status.HTTP_404_NOT_FOUND)

    def test_serializer_methods(self):
        project = self.create_project("T", self.user)
        serializer = ProjectSerializer(project, context={"request": None})
        
        self.assertEqual(serializer.data["tasks_count"], 0)
        member = self.create_membership(
            project, self.other_user, role_name="Member"
        )
        membership_serializer = ProjectMembershipSerializer(member)
        details = membership_serializer.data["user_details"]
        self.assertEqual(details["id"], self.other_user.id)
        self.assertEqual(details["email"], self.other_user.email)


class ProjectMembershipAPITests(ProjectsAPITests):
    def setUp(self):
        super().setUp()
        self.project = self.create_project(name="Team", owner=self.user)

    def test_owner_sees_members(self):
        self.create_membership(self.project, self.other_user, role_name="Viewer")
        url = f"{reverse('project-membership-list')}?project={self.project.id}"
        response = self.api_get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["user_details"]["id"], self.other_user.id)

    def test_member_can_view_project(self):
        self.create_membership(
            self.project, self.other_user, role_name="Viewer"
        )
        url = reverse("project-detail", kwargs={"pk": self.project.id})
        response = self.api_get(url, token=self.other_token)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_kick_actions(self):
        self.create_membership(
            self.project, self.other_user, role_name="Member"
        )
        url = reverse("project-kick", kwargs={"pk": self.project.id})
        self.assertEqual(
            self.api_post(url, {"user_id": self.other_user.id}).status_code, status.HTTP_200_OK,
        )
        self.assertFalse(ProjectMembership.objects.filter(user=self.other_user, project=self.project).exists())

        # kick owner
        self.assertEqual(self.api_post(url, {"user_id": self.user.id}).status_code, status.HTTP_404_NOT_FOUND)

        # forbidden non-admin
        reponse = self.client.post(
            url,
            {"user_id": self.user.id},
            HTTP_AUTHORIZATION=f"Bearer {self.other_token}",
        )
        self.assertEqual(reponse.status_code, status.HTTP_404_NOT_FOUND)


class RoleAPITests(ProjectsAPITests):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.project = cls.create_project("RA", owner=cls.user)
        cls.admin_role = cls.create_role("Admin")
        cls.create_membership(cls.project, cls.user, role_name="Admin")

    def test_assign_and_prevent_duplicate(self):
        """Assigning a role to a user and preventing duplicate assignments"""
        # ensure other_user is a project member
        self.create_membership(self.project, self.other_user, role_name="Viewer")
        url = reverse("project-assign-role", kwargs={"pk": self.project.id})

        # first assignment should succeed
        response1 = self.api_post(url, {"user_id": self.other_user.id, "role_id": self.admin_role.id})
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # second identical assignment should fail
        response2 = self.api_post(url, {"user_id": self.other_user.id, "role_id": self.admin_role.id})
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_assign_to_owner(self):
        """Owner of the project cannot be assigned a role"""
        url = reverse("project-assign-role", kwargs={"pk": self.project.id})
        response = self.api_post(url, {"user_id": self.user.id, "role_id": self.admin_role.id})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_fixed_role_unauthenticated(self):
        """Anonymous users should not be able to delete roles"""
        self.client.credentials()  # remove authentication
        role = self.create_role(name="Member")
        response = self.client.delete(reverse("role-detail", kwargs={"pk": role.id}))
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_api_disallows_role_modification(self):
        role = self.create_role("Member")
        
        # Test POST not allowed
        response = self.api_post(self.role_list_ep, {"name": "Moderator", "permissions": []})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        # Test PATCH not allowed
        response = self.client.patch(reverse("role-detail", kwargs={"pk": role.id}), {"name": "Admin"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        # Test DELETE not allowed
        response = self.client.delete(reverse("role-detail", kwargs={"pk": role.id}))
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class ShareLinkTests(ProjectsAPITests):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.project = cls.create_project("SL", owner=cls.user)
        cls.proj_neg = cls.create_project("SLNeg", owner=cls.user)
        cls.role = cls.create_role("Member")
        cls.role_neg = cls.create_role("Viewer")

    def test_generate_and_join(self):
        url = reverse(
            "project-share-links-list", kwargs={"project_pk": self.project.id}
        )
        response = self.api_post(url, {"role_id": self.role.id, "expires_in": 60})
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        link = ProjectShareLink.objects.get(project=self.project)
        
        # join
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_token}")
        join = self.api_post(
            reverse("join-project", kwargs={"token": link.token}), {}
        )
        
        self.assertEqual(join.status_code, status.HTTP_200_OK)
        self.assertTrue(
            ProjectMembership.objects.filter(
                project=self.project, user=self.other_user
            ).exists()
        )

    def test_invalid_params_and_errors(self):
        # invalid params
        url = reverse(
            "project-share-links-list", kwargs={"project_pk": self.proj_neg.id}
        )
        invite_link = self.api_post(
            url, {"role_id": self.role_neg.id, "max_uses": -5, "expires_in": 0}
        )
        self.assertEqual(invite_link.status_code, status.HTTP_400_BAD_REQUEST)
        
        # expired
        link = ProjectShareLink.objects.create(
            project=self.proj_neg,
            role=self.role_neg,
            max_uses=1,
            expires_at=timezone.now() - timedelta(minutes=5),
            created_by=self.user,
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.other_token}"
        )
        expired_link = self.api_post(
            reverse("join-project", kwargs={"token": link.token}), {}
        )
        self.assertEqual(expired_link.status_code, status.HTTP_403_FORBIDDEN)
        
        # exceeded
        link2 = self.create_share_link(
            self.proj_neg, role=self.role_neg, max_uses=2, used_count=2
        )
        exceeded_link = self.api_post(
            reverse("join-project", kwargs={"token": link2.token}), {}
        )
        self.assertEqual(exceeded_link.status_code, status.HTTP_403_FORBIDDEN)
        
        # already member
        link3 = self.create_share_link(self.proj_neg, role=self.role_neg)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.other_token}"
        )
        self.api_post(
            reverse("join-project", kwargs={"token": link3.token}), {}
        )
        second = self.api_post(
            reverse("join-project", kwargs={"token": link3.token}), {}
        )
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        
        # delete link
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        fake = self.client.delete(
            reverse(
                "project-share-links-detail",
                kwargs={"project_pk": self.project.id, "id": 9999},
            )
        )
        self.assertEqual(fake.status_code, status.HTTP_404_NOT_FOUND)
        
        # delete success
        link_ok = self.create_share_link(self.project)
        success = self.api_delete(
            reverse(
                "project-share-links-detail",
                kwargs={"project_pk": self.project.id, "id": link_ok.id},
            )
        )
        self.assertEqual(success.status_code, status.HTTP_204_NO_CONTENT)

    def test_model_methods(self):
        # is_expired / usage_exceeded / is_valid
        expired = self.create_share_link(self.project, expires_in=-1)
        self.assertTrue(expired.is_expired())
        
        used = self.create_share_link(self.project, max_uses=1, used_count=2)
        self.assertTrue(used.is_usage_exceeded())
        
        valid = self.create_share_link(
            self.project, max_uses=5, used_count=1, expires_in=5
        )
        self.assertTrue(valid.is_valid())
