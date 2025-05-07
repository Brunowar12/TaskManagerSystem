from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.conf import settings


class ProjectsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "projects"

    def ready(self):
        post_migrate.connect(self.create_roles_and_permissions, sender=self)

    def create_roles_and_permissions(self, **kwargs):
        from django.contrib.auth.models import Permission
        from .models import Role
        
        for role_name, perm_codenames in settings.ROLE_PERMISSIONS.items():
            role, created = Role.objects.get_or_create(name=role_name)
            perms = Permission.objects.filter(codename__in=perm_codenames)
            role.permissions.set(perms)
            role.save()
