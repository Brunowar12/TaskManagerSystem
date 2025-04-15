from django.contrib import admin
from .models import Role, Project, ProjectMembership, ProjectShareLink

admin.site.register([Role, Project, ProjectMembership, ProjectShareLink])