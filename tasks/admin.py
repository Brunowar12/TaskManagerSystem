from django.contrib import admin
from .models import Task, Category, Project, Role, ProjectMembership

admin.site.register([Task, Category, Project, Role, ProjectMembership])