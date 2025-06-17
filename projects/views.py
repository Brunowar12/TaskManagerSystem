import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.mixins import UserQuerysetMixin
from api.utils import error_response, status_response

from .models import Project, ProjectMembership, Role, ProjectShareLink
from .serializers import (
    KickUserSerializer, ProjectSerializer, ProjectShareLinkSerializer,
    RoleSerializer, ProjectMembershipSerializer, ShareLinkCreateSerializer
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
    queryset = Project.objects.all().prefetch_related("tasks")
    permission_classes = [IsAuthenticated]

    ACTION_PERMISSIONS = {
        "list": ["Viewer"],
        "retrieve": ["Viewer"],
        "update": ["Member"],
        "partial_update": ["Member"],
        "assign_role": ["Moderator"],
        "generate_share_link": ["Moderator"],
        "delete_share_link": ["Moderator"],
        "kick": ["Admin"],
        "destroy": ["Admin"],
        "leave_project": ["Viewer"],
    }

    def get_permissions(self):
        perms = [IsAuthenticated()]
        min_role = self.ACTION_PERMISSIONS.get(self.action)
        if min_role:
            perms.append(
                IsProjectAdmin()
                if min_role == "Admin"
                else IsProjectMinRole(min_role)
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

    #
    # === HELPERS ===
    #

    def _get_project(self, pk=None):
        return ProjectService.get_project_or_404(
            pk or self.kwargs["pk"], self.request.user
        )

    def _get_membership(self, project, user):
        return ProjectMembership.objects.filter(
            project=project, user=user
        ).first()

    def _forbidden(self, msg):
        return error_response(msg, status.HTTP_403_FORBIDDEN)

    #
    # === ACTIONS ===
    #

    @action(detail=True, methods=["post"])
    def assign_role(self, request, pk=None):
        """
        Assign a role to a user in a project.
        Prevents self-assignment, assigning to owner,
        or assigning role ≥ assigner's role (except Admin/Owner).
        """
        project = self._get_project(pk)
        target = get_object_or_404(User, id=request.data.get("user_id"))
        new_role = get_object_or_404(Role, id=request.data.get("role_id"))

        if target == project.owner:
            return error_response("Cannot assign role to the project owner")
        if target == request.user:
            return self._forbidden("You cannot change your own role")

        if not self._get_membership(project, target):
            return error_response("User must join via ShareLink")

        assigner = self._get_membership(project, request.user)
        assigner_role = assigner.role.name if assigner else "Owner"

        hierarchy = settings.ROLE_ORDER
        if (
            assigner_role not in ("Admin", "Owner") and
            hierarchy.index(new_role.name) >= hierarchy.index(assigner_role)
        ):
            return error_response(
                f"Cannot assign role '{new_role.name}'",
                status.HTTP_403_FORBIDDEN,
            )

        try:
            ProjectMembershipService.assign_role(project, target, new_role)
            return status_response("Role assigned successfully", status.HTTP_200_OK)
        except ValidationError as e:
            return error_response(e.messages[0], exc=e)
        except Exception as e:
            message = getattr(e, 'detail', str(e))
            return error_response(message, exc=e)

        return status_response("Role assigned")

    @action(
        detail=True, methods=["post"], url_path="kick",
        serializer_class=KickUserSerializer
    )
    def kick(self, request, pk=None):
        """
        Kick user from project (not owner)
        """
        project = self._get_project(pk)
        user_id = request.data.get("user_id")
        membership = get_object_or_404(
            ProjectMembership, project=project, user__id=user_id
        )
        if membership.user == project.owner:
            return error_response("Cannot kick project owner")

        membership.delete()
        return status_response("Member excluded")

    @action(detail=True, methods=["post"], url_path="leave")
    def leave_project(self, request, pk=None):
        """
        Leave project (not owner)
        """
        project = self._get_project(pk)
        if project.owner == request.user:
            return self._forbidden("Owner cannot leave project")

        membership = self._get_membership(project, request.user)
        if not membership:
            return error_response("Not a member of this project")

        membership.delete()
        return status_response("You left the project")


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


class ProjectShareLinkViewSet(viewsets.ModelViewSet):
    """
    Read-only viewset for viewing project share links
    """

    lookup_field = "id"
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        perms = super().get_permissions()
        if self.action in ("list", "retrieve", "create", "destroy"):
            perms.append(IsProjectMinRole("Moderator"))
        return perms

    def get_queryset(self):
        project = ProjectService.get_project_or_404(
            self.kwargs["project_pk"], self.request.user
        )
        return ProjectShareLink.objects.filter(project=project)

    def get_serializer_class(self):
        if self.action == "create":
            return ShareLinkCreateSerializer
        return ProjectShareLinkSerializer

    def create(self, request, *args, **kwargs):
        project = ProjectService.get_project_or_404(
            self.kwargs["project_pk"], request.user
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
        output = ProjectShareLinkSerializer(
            share_link, context={"request": request}
        )
        return Response(output.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        project = ProjectService.get_project_or_404(
            self.kwargs["project_pk"], request.user
        )
        share_link = get_object_or_404(
            ProjectShareLink, id=self.kwargs["id"], project=project
        )
        share_link.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
