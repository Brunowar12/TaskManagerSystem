from django.urls import path
from .views import TaskCreateView, TaskListView, TaskDetailView

urlpatterns = [
    path('', TaskListView.as_view(), name='task-list'), # Список всіх задач
    path('create/', TaskCreateView.as_view(), name='task-create'), # Створення задачі
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'), # Деталі, оновлення та видалення
]