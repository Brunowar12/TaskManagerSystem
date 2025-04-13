import logging
import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import Permission
from django.core.validators import RegexValidator

TEXT_FIELD_VALIDATOR = RegexValidator(
    r"^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ0-9_. -]+$",
    "Text can contain letters (latin/cyrillic), numbers, underscores, dots, dashes, and spaces",
)

logger = logging.getLogger(__name__)

class ProjectShareLink(models.Model):
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    project = models.ForeignKey("Project", on_delete=models.CASCADE, related_name="share_links")
    role = models.ForeignKey("Role", on_delete=models.CASCADE, related_name="share_links", help_text="Role for invited user")
    max_uses = models.PositiveIntegerField(default=1)
    used_count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid(self):
        return self.used_count < self.max_uses and timezone.now() < self.expires_at
    
    def __str__(self):
        return f"Link to {self.project.name} ({self.role.name})"


class Role(models.Model):
    name = models.CharField(max_length=64, unique=True)
    permissions = models.ManyToManyField(Permission, blank=True)

    def __str__(self):
        return self.name


class ProjectMembership(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="project_memberships")
    project = models.ForeignKey("Project", on_delete=models.CASCADE, related_name="memberships")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="members")
    
    class Meta:
        unique_together = ("user", "project")
    
    def __str__(self):
        return f"{self.user.username} - {self.project.name} ({self.role.name})"


class Project(models.Model):
    name = models.CharField(max_length=128, validators = [TEXT_FIELD_VALIDATOR])
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["id"]
    
    def __str__(self):
        return f"{self.name} (Owner: {self.owner.username})"


class Category(models.Model):
    name = models.CharField(
        max_length=20,
        validators=[TEXT_FIELD_VALIDATOR]
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="categories"
    )

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.name} (User: {self.user.username})"

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('L', 'Low'),
        ('M', 'Medium'),
        ('H', 'High'),
    ]

    title = models.CharField(max_length=64, validators=[TEXT_FIELD_VALIDATOR])
    description = models.TextField(blank=True, 
        validators=[TEXT_FIELD_VALIDATOR])
    completed = models.BooleanField(default=False)
    due_date = models.DateTimeField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="tasks")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, 
        related_name="tasks")
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="tasks",
        null=True, blank=True
    )
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, 
        default='M')
    is_favorite = models.BooleanField(default=False, verbose_name="Favorite")

    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['id']

    def update_completed_at(self):
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.completed and self.completed_at:
            self.completed_at = None

    def save(self, *args, **kwargs):
        self.update_completed_at()        
        super().save(*args, **kwargs)
        
        if self.completed and hasattr(self.user, 'last_task_completed_at'):
            try:
                self.user.last_task_completed_at = timezone.now()
                self.user.save(update_fields=["last_task_completed_at"])
            except Exception as e:
                logger.error("Error updating user last_task_completed_at: %s", e)


    def __str__(self):
        return f"{self.title} - {self.user.username if self.user else 'No user'}"
