import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response

from django.contrib.auth import get_user_model
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from django.views.decorators.cache import cache_page
from drf_yasg.utils import swagger_auto_schema

from api.mixins import UserQuerysetMixin
from api.utils import error_response, status_response
from projects.permissions import IsProjectMinRole

from .serializers import (
    TaskSerializer, CategorySerializer,
    ToggleCompletedResponseSerializer, ToggleFavoriteResponseSerializer,
    MoveTaskResponseSerializer, MoveTaskSerializer, 
)
from .services import TaskService, CategoryService
from .mixins import IsOwner, ProjectTaskPermission
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
    ordering_fields = [
        "title", "due_date", "priority",
        "created_at", "updated_at",
    ]

    def get_permissions(self):
        if self.kwargs.get('project_pk'):
            return [IsAuthenticated(), ProjectTaskPermission()]
        return [IsAuthenticated(), IsOwner()]

    def get_queryset(self):
        qs = super().get_queryset()        
        filters = Q(user=self.request.user)

        project_id = self.kwargs.get("project_pk")
        if project_id is not None:
            return Task.objects.filter(project_id=project_id)

        if TaskService.is_today_filter(self.request):
            filters &= Q(due_date__date=now().date())

        priority = self.request.query_params.get("priority")
        if priority in ["L", "M", "H"]:
            filters &= Q(priority=priority)

        completed = self.request.query_params.get("completed")
        if completed is not None:
            filters &= Q(completed=completed.lower() == "true")

        is_fav = self.request.query_params.get("is_favorite")
        if is_fav is not None:
            filters &= Q(is_favorite=is_fav.lower() == "true")

        return qs.filter(filters)

    def perform_create(self, serializer):
        project_pk = self.kwargs.get('project_pk')
        save_kwargs = {'user': self.request.user}
        if project_pk is not None:
            save_kwargs['project_id'] = project_pk
        serializer.save(**save_kwargs)

    def get_object(self):
        obj = get_object_or_404(Task, pk=self.kwargs.get(self.lookup_field))
        try:
            self.check_object_permissions(self.request, obj)
        except PermissionDenied:
            if self.request.method in SAFE_METHODS:
                raise NotFound()
            raise
        return obj

    @action(
        detail=True, methods=["post"],
        serializer_class=ToggleFavoriteResponseSerializer
    )
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
            return error_response(
                "Failed to update favorite status",
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(
        detail=True, methods=["post"],
        serializer_class=ToggleCompletedResponseSerializer,
        permission_classes=[IsProjectMinRole('Member')]
    )
    def toggle_completed(self, request, project_pk=None, pk=None):
        try:
            task = self.get_object()
            updated_task = TaskService.toggle_completed(task, self.request.user)
            logger.info(
                f"Task {task.id} completion status updated to {updated_task.completed}"
            )
            return Response(
                {
                    "status": "completion status updated",
                    "completed": updated_task.completed,
                    "completed_at": updated_task.completed_at,
                    "completed_by": (
                        updated_task.completed_by.id
                        if updated_task.completed_by
                        else None
                    ),
                }
            )
        except Exception as e:
            logger.error(f"Error toggling completion for task {pk}: {e}")
            return error_response(
                "Failed to update completion status",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(
        detail=False, methods=["get"],
        permission_classes=[IsProjectMinRole("Member")],
    )
    @method_decorator(cache_page(60))
    def today(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    @method_decorator(cache_page(60))
    def favorites(self, request):
        favorites_qs = self.get_queryset().filter(is_favorite=True)
        serializer = self.get_serializer(favorites_qs, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        method='post',
        request_body=MoveTaskSerializer,
        responses={200: MoveTaskResponseSerializer}
    )
    @action(
        detail=True, methods=["post"],
        serializer_class=MoveTaskSerializer
    )
    def move_task(self, request, project_pk=None, pk=None):
        if project_pk is not None:
            raise NotFound("Use /tasks/{pk}/move_task/ to move tasks")

        task = self.get_object()
        project_id = request.data.get("project_id")

        try:
            TaskService.move_task_to_project(task, project_id, request.user)
            return status_response("Task moved successfully")
        except ValueError as e:
            return error_response(str(e), status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error moving task: {e}", exc_info=True)
            return error_response(
                "Failed to move task", status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(
        detail=True, methods=["post"],
        url_path='move_task', permission_classes=[IsAuthenticated],
    )
    @swagger_auto_schema(auto_schema=None)
    def nested_move_task(self, request, project_pk=None, pk=None):
        if getattr(self, 'swagger_fake_view', False):
            raise NotFound()
        return self.move_task(request, pk=pk)


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
        serializer = TaskSerializer(
            tasks, many=True, context={"request": request}
        )
        return Response(serializer.data)
