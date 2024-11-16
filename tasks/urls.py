from django.urls import path, include
from .views import (
    TaskCreateView,
    TaskListView,
    TaskDetailView,
    CategoryListView,
    CategoryCreateView,
    CategoryDetailView,
)

urlpatterns = [
    path('tasks/', include([
        path('', TaskListView.as_view(), name='task-list'),
        path('create/', TaskCreateView.as_view(), name='task-create'),
        path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    ])),

    path('categories/', include([
        path('', CategoryListView.as_view(), name='category-list'),
        path('create/', CategoryCreateView.as_view(), name='category-create'),
        path('<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    ])),
]