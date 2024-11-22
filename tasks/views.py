import logging
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .serializers import TaskSerializer, CategorySerializer
from .mixins import UserQuerysetMixin

# Create a task
class TaskCreateView(UserQuerysetMixin, generics.CreateAPIView):
    serializer_class = TaskSerializer

# Task list
class TaskListView(UserQuerysetMixin, generics.ListAPIView):
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_favorite"]

# Task details, updates, and deletion
class TaskDetailView(UserQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer

    @action(detail=True, methods=["post"])
    def toggle_favorite(self, request, pk=None):
        try:
            task = self.get_object()
            task.is_favorite = not task.is_favorite
            task.save()
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

# HTML Page View
def user_page(request):    
    return render(request, 'main/user.html', {"user": request.user})