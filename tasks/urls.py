from django.urls import path, include
from .views import (
    TaskCreateView, TaskListView, TaskDetailView,
    CategoryListView, CategoryCreateView, CategoryDetailView,
)

urlpatterns = [
    path('', include([
        path('', TaskListView.as_view(), name='task-list'), # List of all tasks
        path('create/', TaskCreateView.as_view(), name='task-create'), # Create a task
        path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'), # Details, updates and deletions
    ])),

    path('categories/', include([
        path('', CategoryListView.as_view(), name='category-list'), # List of categories
        path('create/', CategoryCreateView.as_view(), name='category-create'), # Create a category
        path('<int:pk>/', CategoryDetailView.as_view(), name='category-detail'), # Details, updates, and deletions
    ])),
]