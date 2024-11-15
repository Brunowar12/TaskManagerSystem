from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from .models import Task
from .serializers import TaskSerializer

# Створення задачі
class TaskCreateView(generics.CreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Список задач
class TaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_favorite']

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

# Деталі задачі, оновлення та видалення
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        task = self.get_object()
        task.is_favorite = not task.is_favorite
        task.save()
        return Response({"status": "favorite status updated", "is_favorite": task.is_favorite})
