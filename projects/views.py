import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.db.models import Q, Count
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.mixins import UserQuerysetMixin
from api.utils import error_response, status_response
from tasks.serializers import TaskSerializer

from .models import Project, ProjectMembership, Role, ProjectShareLink
from .serializers import (
    ProjectSerializer, RoleSerializer, ProjectMembershipSerializer, 
    PermissionSerializer, ShareLinkSerializer
)
from .services import ProjectService, ProjectMembershipService
from .permissions import IsProjectAdmin

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

    def get_queryset(self):
        user = self.request.user
        return (
            self.queryset
            .filter(Q(owner=user) | Q(memberships__user=user))
            .annotate(tasks_count=Count("tasks"))
            .distinct()
            .order_by('id')
        )

    @action(detail=True, methods=["get"])
    def tasks(self, request, pk=None):
        project = self.get_object()
        tasks = ProjectService.get_tasks_for_project(project)
        serializer = TaskSerializer(
            tasks, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsProjectAdmin])
    def assign_role(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get("user_id")
        role_id = request.data.get("role_id")

        user = get_object_or_404(User, id=user_id)
        role = get_object_or_404(Role, id=role_id)
        
        try:
            ProjectMembershipService.assign_role(project, user, role)
        except ValidationError as e:
            return error_response(str(e.detail))
        except Exception as e:
            return error_response(str(e))
        
        return status_response("Role assigned")

    @action(detail=True, methods=["post"], permission_classes=[IsProjectAdmin])
    def generate_share_link(self, request, pk=None):
        project = self.get_object()
        serializer = ShareLinkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        role = get_object_or_404(Role, id=serializer.validated_data["role_id"])
        max_uses = serializer.validated_data.get("max_uses")
        expires_in = serializer.validated_data["expires_in"]

        expires_at = timezone.now() + timezone.timedelta(minutes=expires_in)
        
        share_link = ProjectShareLink.objects.create(
            project=project,
            role=role,
            max_uses=max_uses,
            expires_at=expires_at,
            created_by=request.user,
        )
        
        return Response({"share_url": f"/projects/join/{share_link.token}/"}, status=201)

    @action(detail=True, methods=["delete"], permission_classes=[IsProjectAdmin])
    def delete_share_link(self, request, pk=None, link_id=None):
        project = self.get_object()
        try:
            share_link = ProjectShareLink.objects.get(id=link_id, project=project)
        except ProjectShareLink.DoesNotExist:
            return error_response("Share link not found", status.HTTP_404_NOT_FOUND)

        share_link.delete()
        return status_response("Share link deleted", status.HTTP_204_NO_CONTENT)


class RoleViewSet(viewsets.ModelViewSet):
    """    
    ViewSet for operations with roles
    
    Allows you to view, create, edit, and delete roles    
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsProjectAdmin()]
        return [IsAuthenticated()]
    
    def get_object(self):
        obj = super().get_object()
        try:
            self.check_object_permissions(self.request, obj)
        except PermissionDenied:
            raise Http404
        return obj
    
    def destroy(self, request, *args, **kwargs):
        role = self.get_object()
        
        if ProjectMembership.objects.filter(role=role).exists():
            return error_response("Cannot delete role that is assigned to users")
        
        return super().destroy(request, *args, **kwargs)


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer


class ProjectMembershipViewSet(viewsets.ModelViewSet):
    queryset = ProjectMembership.objects.all()
    serializer_class = ProjectMembershipSerializer

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
    link = get_object_or_404(
        ProjectShareLink.objects.select_related("project", "role"), token=token
    )
    
    if link.used_count >= link.max_uses:
        return error_response("Link usage limit exceeded", status.HTTP_403_FORBIDDEN)

    if not link.is_valid():
        return error_response(
            "Link expired or max uses reached", status.HTTP_403_FORBIDDEN
        )

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
