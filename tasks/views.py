import logging
from django.utils.timezone import now
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from .serializers import TaskSerializer, CategorySerializer
from .services import TaskService
from .mixins import UserQuerysetMixin

# Create a task
class TaskCreateView(UserQuerysetMixin, generics.CreateAPIView):
    serializer_class = TaskSerializer

# Task list
class TaskListView(UserQuerysetMixin, generics.ListAPIView):
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["is_favorite", "title", "due_date"]
    ordering_fields = ["is_favorite", "title", "due_date"]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if TaskService.is_today_filter(self.request):
            try:
                return queryset.filter(due_date__date=now().date())
            except Exception as e:
                logging.error(f"Error filtering today's tasks: {e}")
                raise ValidationError("Error filtering today's tasks") from e
        return queryset

# Task details, updates, and deletion
class TaskDetailView(UserQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer

    @action(detail=True, methods=["post"])
    def toggle_favorite(self, request, pk=None):
        try:
            task = self.get_object()
            TaskService.toggle_favorite(task)
            logging.info(f"Task {task.id} favorite status updated to {task.is_favorite}")
            return Response({"status": "favorite status updated", "is_favorite": task.is_favorite})
        except Exception as e:
            logging.error(f"Error toggling favorite for task {pk}: {e}")
            return Response({"error": "Failed to update favorite status"}, status=500)
            
class CategoryCreateView(UserQuerysetMixin, generics.CreateAPIView):
    serializer_class = CategorySerializer

class CategoryListView(UserQuerysetMixin, generics.ListAPIView):
    serializer_class = CategorySerializer

class CategoryDetailView(UserQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer