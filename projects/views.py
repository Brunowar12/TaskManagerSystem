import logging
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.mixins import UserQuerysetMixin
from api.utils import error_response, status_response

from .models import Project, ProjectMembership, Role, ProjectShareLink
from .serializers import (
    KickUserSerializer, ProjectSerializer, RoleSerializer, 
    ProjectMembershipSerializer, ShareLinkSerializer
)
from .services import (
    ProjectService, ProjectMembershipService, ProjectShareLinkService,
)
from .permissions import IsProjectAdmin, IsProjectMinRole

logger = logging.getLogger(__name__)
User = get_user_model()


class ProjectViewSet(UserQuerysetMixin, viewsets.ModelViewSet):
    """
    ViewSet for operations with projects
    
    Allows you to view, create, edit, and delete projects
    Includes an additional method for getting tasks in a project
    """
    serializer_class = ProjectSerializer
    queryset = Project.objects.all().prefetch_related('tasks')
    permission_classes = [IsAuthenticated]

    ACTION_PERMISSIONS = {
        "list": [IsProjectMinRole("Viewer")],
        "retrieve": [IsProjectMinRole("Viewer")],
        "create": [IsProjectMinRole("Member")],
        "update": [IsProjectMinRole("Member")],
        "partial_update": [IsProjectMinRole("Member")],
        "assign_role": [IsProjectMinRole("Moderator"), IsProjectAdmin()],
        "generate_share_link": [
            IsProjectMinRole("Moderator"),
            IsProjectAdmin(),
        ],
        "delete_share_link": [IsProjectMinRole("Moderator"), IsProjectAdmin()],
        "kick": [IsProjectMinRole("Admin"), IsProjectAdmin()],
        "destroy": [IsProjectMinRole("Admin"), IsProjectAdmin()],
    }

    def get_permissions(self):
        perms = [IsAuthenticated()] + self.ACTION_PERMISSIONS.get(
            self.action, []
        )
        return perms

    def get_queryset(self):
        user = self.request.user
        return (
            self.queryset
            .filter(Q(owner=user) | Q(memberships__user=user))
            .annotate(tasks_count=Count("tasks"))
            .distinct()
            .order_by('id')
        )

    def perform_create(self, serializer):
        project = ProjectService.create_project(
            owner=self.request.user, **serializer.validated_data
        )
        serializer.instance = project

    @action(detail=True, methods=["post"])
    def assign_role(self, request, pk=None):
        project = ProjectService.get_project_or_404(
            pk=self.kwargs["pk"], user=request.user
        )

        user_id = request.data.get("user_id")
        role_id = request.data.get("role_id")

        user = get_object_or_404(User, id=user_id)
        role = get_object_or_404(Role, id=role_id)

        if not ProjectMembership.objects.filter(
            project=project, user=user
        ).exists():
            return error_response(
                "The user must join via invitation (ShareLink)"
            )

        try:
            ProjectMembershipService.assign_role(project, user, role)
        except ValidationError as e:
            return error_response(str(e.detail))
        except Exception as e:
            return error_response(str(e))

        return status_response("Role assigned")

    @action(
        detail=True, methods=["post"], serializer_class=ShareLinkSerializer
    )
    def generate_share_link(self, request, pk=None):      
        project = ProjectService.get_project_or_404(
            pk=self.kwargs["pk"], user=request.user
        )

        if ProjectShareLink.objects.filter(
            project=project, is_active=True, expires_at__gt=timezone.now()
        ).exists():
            return error_response(
                "An active share link already exists for this project"
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        share_link = ProjectShareLinkService.create_share_link(
            project=project,
            role_id=data["role_id"],
            user=request.user,
            max_uses=data.get("max_uses"),
            expires_in=data["expires_in"],
        )
        url = f"/projects/join/{share_link.token}/"
        return Response({"share_url": url}, status=status.HTTP_201_CREATED)

    @action(
        detail=True, methods=["delete"],
        url_path="share_link/(?P<link_id>[^/.]+)",
    )
    def delete_share_link(self, request, pk=None, link_id=None):
        project = ProjectService.get_project_or_404(
            pk=self.kwargs["pk"], user=request.user
        )
        share_link = get_object_or_404(
            ProjectShareLink, id=link_id, project=project
        )
        share_link.delete()
        return status_response(
            "Share link deleted", status.HTTP_204_NO_CONTENT
        )

    @action(
        detail=True, methods=["post"], url_path="kick",
        serializer_class=KickUserSerializer
    )
    def kick(self, request, pk=None):
        project = ProjectService.get_project_or_404(
            pk=self.kwargs["pk"], user=request.user
        )
        user_id = request.data.get("user_id")
        membership = get_object_or_404(
            ProjectMembership, project=project, user__id=user_id
        )

        if membership.user == project.owner:
            return error_response(
                "It is impossible to exclude the project owner"
            )

        membership.delete()
        return status_response("Member successfully excluded")


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read‑only endpoints for project roles.
    
    All roles are created and managed via migrations/signals,
    not via API. This ViewSet only allows listing and retrieving.
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


class ProjectMembershipViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for viewing project members
    """
    serializer_class = ProjectMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        projects = Project.objects.filter(
            Q(owner=user) | Q(memberships__user=user)
        ).distinct()

        return (
            ProjectMembership.objects.filter(project__in=projects)
            .select_related("user", "role")
            .order_by("id")
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_project(request, token):
    with transaction.atomic():
        link = get_object_or_404(
            ProjectShareLink.objects.select_for_update(), token=token
        )
        ProjectShareLinkService.validate_share_link(link)

        already_member = ProjectMembership.objects.filter(
            project=link.project, user=request.user
        ).exists()

        if already_member:
            return status_response(
                "Already a member of this project", status.HTTP_200_OK
            )

        ProjectMembership.objects.create(
            user=request.user, project=link.project, role=link.role
        )
        link.used_count += 1
        link.save(update_fields=["used_count"])

        return status_response(
            "Successfully joined the project", status.HTTP_200_OK
        )
