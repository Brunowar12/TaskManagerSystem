from django.urls import path
from .views import (
    TaskCreateView,
    TaskListView,
    TaskDetailView,
    CategoryListView,
    CategoryCreateView,
    CategoryDetailView,
)

urlpatterns = [
    path('', TaskListView.as_view(), name='task-list'), # Список всіх задач
    path('create/', TaskCreateView.as_view(), name='task-create'), # Створення задачі
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'), # Деталі, оновлення та видалення
    path('categories/', CategoryListView.as_view(), name='category-list'),  # Список категорій
    path('categories/create/', CategoryCreateView.as_view(), name='category-create'),  # Створення категорії
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),  # Деталі, оновлення та видалення
]