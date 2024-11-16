from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from users.models import Category
from .serializers import TaskSerializer, CategorySerializer
import logging

class BaseViewMixin:
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        model = self.serializer_class.Meta.model
        return model.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Create a task
class TaskCreateView(BaseViewMixin, generics.CreateAPIView):
    serializer_class = TaskSerializer

# Task list
class TaskListView(BaseViewMixin, generics.ListAPIView):
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_favorite"]

# Task details, updates, and deletion
class TaskDetailView(BaseViewMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer

    @action(detail=True, methods=["post"])
    def toggle_favorite(self, request, pk=None):
        try:
            task = self.get_object()
            task.is_favorite = not task.is_favorite
            task.save()
            return Response({"status": "favorite status updated", "is_favorite": task.is_favorite})
        except Exception as e:
            logging.error(e)
            return Response({"error": "Failed to update favorite status"}, status=500)
            
class CategoryCreateView(BaseViewMixin, generics.CreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return categories only for the current user
        return Category.objects.filter(user=self.request.user).order_by('id')
    
class CategoryDetailView(BaseViewMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer