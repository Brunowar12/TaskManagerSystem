import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from users.models import Category
from .serializers import TaskSerializer, CategorySerializer
from .services import TaskService, CategoryService
from .mixins import UserQuerysetMixin, IsOwner
from .models import Task

logger = logging.getLogger(__name__)

class TaskViewSet(UserQuerysetMixin, viewsets.ModelViewSet):
    """
    ViewSet for operations with tasks
    
    Allows you to view, create, edit, and delete tasks
    Includes additional methods for changing the favorite status and completion
    """
    serializer_class = TaskSerializer
    queryset = Task.objects.all()
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["title", "description"]
    filterset_fields = ["completed", "priority", "is_favorite", "category"]
    ordering_fields = ["title", "due_date", "priority", "created_at", "updated_at"]
    
    def get_queryset(self):
        """Get a filterable list of tasks"""
        queryset = super().get_queryset()
        
        if TaskService.is_today_filter(self.request):
            queryset = TaskService.filter_today_tasks(queryset)
            
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = TaskService.filter_by_priority(queryset, priority)
            
        return queryset
    
    @action(detail=True, methods=["post"])
    def toggle_favorite(self, request, pk=None):
        try:
            task = self.get_object()
            updated_task = TaskService.toggle_favorite(task)
            logger.info(f"Task {task.id} favorite status updated to {updated_task.is_favorite}")
            return Response({"status": "favorite status updated", "is_favorite": updated_task.is_favorite})
        except Exception as e:
            logger.error(f"Error toggling favorite for task {pk}: {e}")
            return Response({"error": "Failed to update favorite status"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    @action(detail=True, methods=["post"])
    def toggle_completed(self, request, pk=None):
        try:
            task = self.get_object()
            updated_task = TaskService.toggle_completed(task)
            logger.info(f"Task {task.id} completion status updated to {updated_task.completed}")
            return Response({
                "status": "completion status updated",
                "completed": updated_task.completed,
                "completed_at": updated_task.completed_at
            })
        except Exception as e:
            logger.error(f"Error toggling completion for task {pk}: {e}")
            return Response({"error": "Failed to update completion status"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=["get"])
    def today(self, request):
        queryset = super().get_queryset()
        today_tasks = TaskService.filter_today_tasks(queryset)
        serializer = self.get_serializer(today_tasks, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=["get"])
    def favorites(self, request):
        queryset = super().get_queryset().filter(is_favorite=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class CategoryViewSet(UserQuerysetMixin, viewsets.ModelViewSet):
    """
    ViewSet for operations with categories
    
    Allows you to view, create, edit, and delete categories
    Includes an additional method for getting tasks in a category
    """
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [IsAuthenticated, IsOwner]
    
    @action(detail=True, methods=["get"])
    def tasks(self, request, pk=None):
        """Отримати всі завдання для категорії"""
        category = self.get_object()
        tasks = CategoryService.get_tasks_for_category(category)
        serializer = TaskSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)