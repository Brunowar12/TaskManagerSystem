from django.urls import path, include
from api.views import api_status

urlpatterns = [
    path("status/", api_status),
    path("account/", include("users.urls")),
    path("tasks/", include("tasks.urls")),
    path("projects/", include("projects.urls")),
]
