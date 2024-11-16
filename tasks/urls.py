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
    path('', TaskListView.as_view(), name='task-list'), # List of all tasks
    path('create/', TaskCreateView.as_view(), name='task-create'), # Create a task
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'), # Details, updates and deletions
    path('categories/', CategoryListView.as_view(), name='category-list'),  # List of categories
    path('categories/create/', CategoryCreateView.as_view(), name='category-create'),  # Create a category
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),  # Details, updates, and deletions
]
