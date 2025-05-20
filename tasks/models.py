# mypy: disable-error-code=var-annotated

import logging

from django.conf import settings
from django.db import models
from django.dispatch import receiver
from django.utils import timezone

from api.validators import TEXT_FIELD_VALIDATOR
from projects.models import Project

logger = logging.getLogger(__name__)


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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks_completed",
        help_text="User who marked the task as completed",
    )

    class Meta:
        indexes = [models.Index(fields=["due_date"]),]
        ordering = ['id']

    def update_completed_at(self):
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.completed and self.completed_at:
            self.completed_at = None

    def save(self, *args, **kwargs):
        self.update_completed_at()        
        super().save(*args, **kwargs)

    def __str__(self):
        user_display = self.user.username if self.user else "No user"
        return f"{self.title} - {user_display}"


@receiver(models.signals.post_save, sender=Task)
def update_user_last_task_completed(sender, instance, created, **kwargs):
    if instance.completed and instance.user:
        instance.user.last_task_completed_at = timezone.now()
        instance.user.save(update_fields=["last_task_completed_at"])
