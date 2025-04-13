import logging
from rest_framework import viewsets, status
from django.contrib.auth.models import Permission
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend

from .serializers import (
    TaskSerializer, CategorySerializer, ProjectSerializer,
    RoleSerializer, ProjectMembershipSerializer, PermissionSerializer
)
from .services import TaskService, CategoryService, ProjectService
from .mixins import UserQuerysetMixin, IsOwner
from .models import Task, Category, Project, ProjectMembership, Role, ProjectShareLink
from .permissions import IsProjectAdmin

logger = logging.getLogger(__name__)
User = get_user_model()

class TaskViewSet(UserQuerysetMixin, viewsets.ModelViewSet):
    """
    ViewSet for operations with tasks
    
    Allows you to view, create, edit, and delete tasks
    Includes additional methods for changing the favorite status and completion
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    queryset = Task.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["title", "description"]
    filterset_fields = ["completed", "priority", "is_favorite", "category"]
    ordering_fields = ["title", "due_date", "priority", "created_at", "updated_at"]

    def get_queryset(self):
        base_qs = super().get_queryset().filter(user=self.request.user)
        task_service = TaskService()
        if task_service.is_today_filter(self.request):
            base_qs = task_service.filter_today_tasks(base_qs)
        priority = self.request.query_params.get("priority")
        if priority:
            base_qs = task_service.filter_by_priority(base_qs, priority)
        return base_qs
    
    def get_object(self):
        """
        Overridden method for getting an object without first filtering by user.
        """
        lookup_field = self.lookup_field or "pk"
        lookup_value = self.kwargs.get(lookup_field)
        try:
            obj = Task.objects.get(pk=lookup_value)
        except Task.DoesNotExist:
            raise NotFound()
        try:
            self.check_object_permissions(self.request, obj)
        except PermissionDenied:
            if self.request.method in SAFE_METHODS:
                raise NotFound()
            raise
        return obj

    @action(detail=True, methods=["post"])
    def toggle_favorite(self, request, pk=None):
        try:
            task = self.get_object()
            updated_task = TaskService.toggle_favorite(task)
            logger.info(
                f"Task {task.id} favorite status updated to {updated_task.is_favorite}"
            )
            return Response({
                    "status": "favorite status updated",
                    "is_favorite": updated_task.is_favorite,
                })
        except Exception as e:
            logger.error(f"Error toggling favorite for task {pk}: {e}")
            return Response(
                {"error": "Failed to update favorite status"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["post"])
    def toggle_completed(self, request, pk=None):
        try:
            task = self.get_object()
            updated_task = TaskService.toggle_completed(task)
            logger.info(
                f"Task {task.id} completion status updated to {updated_task.completed}"
            )
            return Response({
                    "status": "completion status updated",
                    "completed": updated_task.completed,
                    "completed_at": updated_task.completed_at,
                })
        except Exception as e:
            logger.error(f"Error toggling completion for task {pk}: {e}")
            return Response(
                {"error": "Failed to update completion status"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["get"])
    def today(self, request):
        today_tasks = TaskService.filter_today_tasks(self.get_queryset())
        serializer = self.get_serializer(today_tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def favorites(self, request):
        favorites_qs = self.get_queryset().filter(is_favorite=True)
        serializer = self.get_serializer(favorites_qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def move_task(self, request, pk=None):
        task = self.get_object()
        project_id = request.data.get("project_id")

        try:
            TaskService.move_task_to_project(task, project_id, request.user)
            return Response({"status": "Task moved successfully"})
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error moving task: {e}", exc_info=True)
            return Response(
                {"error": "Failed to move task"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CategoryViewSet(UserQuerysetMixin, viewsets.ModelViewSet):
    """
    ViewSet for operations with categories
    
    Allows you to view, create, edit, and delete categories
    Includes an additional method for getting tasks in a category
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsOwner]
    queryset = Category.objects.all()
    
    @action(detail=True, methods=["get"])
    def tasks(self, request, pk=None):
        category = self.get_object()
        tasks = CategoryService.get_tasks_for_category(category)
        serializer = TaskSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)


class ProjectViewSet(UserQuerysetMixin, viewsets.ModelViewSet):
    """
    ViewSet for operations with projects
    
    Allows you to view, create, edit, and delete projects
    Includes an additional method for getting tasks in a project
    """
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(owner=self.request.user)

    @action(detail=True, methods=["get"])
    def tasks(self, request, pk=None):
        project = self.get_object()
        tasks = ProjectService.get_tasks_for_project(project)
        serializer = TaskSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsProjectAdmin])
    def assign_role(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get("user_id")
        role_id = request.data.get("role_id")
        try:
            user = User.objects.get(id=user_id)
            role = Role.objects.get(id=role_id)
        except (User.DoesNotExist, Role.DoesNotExist):
            return Response(
                {"error": "User or Role not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        membership, created = ProjectMembership.objects.get_or_create(
            user=user, project=project, defaults={"role": role}
        )
        if not created:
            membership.role = role
            membership.save()
        return Response({"status": "Role assigned"})
    
    @action(detail=True, methods=["post"], permission_classes=[IsProjectAdmin])
    def generate_share_link(self, request, pk=None):
        project = self.get_object()
        role_id = request.data.get("role_id")
        max_uses = int(request.data.get("max_uses", 1))
        expires_in_minutes = int(request.data.get("expires_in", 60))

        try:
            role = Role.objects.get(id=role_id)
        except Role.DoesNotExist:
            return Response({"error": "Role not found"}, status=404)

        share_link = ProjectShareLink.objects.create(
            project=project,
            role=role,
            max_uses=max_uses,
            expires_at=timezone.now() + timezone.timedelta(minutes=expires_in_minutes),
            created_by=request.user
        )

        return Response({"share_url": f"/projects/join/{share_link.token}/"}, status=201)


class RoleViewSet(viewsets.ModelViewSet):
    """    
    ViewSet for operations with roles
    
    Allows you to view, create, edit, and delete roles    
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer

class ProjectMembershipViewSet(viewsets.ModelViewSet):
    """
    ViewSet for operations with project memberships
    
    Allows you to view, create, edit, and delete project memberships
    """
    queryset = ProjectMembership.objects.all()
    serializer_class = ProjectMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProjectMembership.objects.filter(user=self.request.user)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_project(request, token):
    try:
        link = ProjectShareLink.objects.select_related("project", "role").get(token=token)
    except ProjectShareLink.DoesNotExist:
        return Response({"error": "Invalid link"}, status=404)

    if not link.is_valid():
        return Response({"error": "Link expired or max uses reached"}, status=403)

    already_member = ProjectMembership.objects.filter(project=link.project, user=request.user).exists()
    if already_member:
        return Response({"info": "Already a member of the project"}, status=200)

    ProjectMembership.objects.create(
        user=request.user,
        project=link.project,
        role=link.role
    )
    link.used_count += 1
    link.save(update_fields=["used_count"])

    return Response({"status": "Successfully joined the project"}, status=200)
