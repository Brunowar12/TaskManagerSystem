from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from .models import Task
from users.models import Category
from .serializers import TaskSerializer, CategorySerializer

# Create a task
class TaskCreateView(generics.CreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Task list
class TaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_favorite"]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

# Task details, updates, and deletion
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle_favorite(self, request, pk=None):
        task = self.get_object()
        task.is_favorite = not task.is_favorite
        task.save()
        return Response(
            {"status": "favorite status updated", "is_favorite": task.is_favorite}
        )
        
class CategoryCreateView(generics.CreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Assign a category to the current user
        serializer.save(user=self.request.user)

class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return categories only for the current user
        return Category.objects.filter(user=self.request.user).order_by('id')
    
class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise Http404
        return obj