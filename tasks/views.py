import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend

from api.mixins import UserQuerysetMixin

from .serializers import (
    TaskSerializer, CategorySerializer
)
from .services import TaskService, CategoryService
from .mixins import IsOwner
from .models import Task, Category

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