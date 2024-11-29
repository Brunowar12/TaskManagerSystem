from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.validators import RegexValidator
from users.models import Category

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('L', 'Low'),
        ('M', 'Medium'),
        ('H', 'High'),
    ]

    title = models.CharField(max_length=64,
        validators=[
            RegexValidator(
                r"^[a-zA-Z0-9_. -]+$",
                "Title can only contain letters, numbers, underscores, dots, dashes, and spaces",
            )])
    description = models.TextField(blank=True, validators=[
            RegexValidator(
                r"^[a-zA-Z0-9_. -]+$",
                "Title can only contain letters, numbers, underscores, dots, dashes, and spaces",
            )])
    completed = models.BooleanField(default=False)
    due_date = models.DateTimeField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks")
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, default='M')
    is_favorite = models.BooleanField(default=False, verbose_name="Favorite")

    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # def mark_as_completed(self): # Зараз працює некоректно
    #     self.completed = True
    #     self.completed_at = timezone.now()
    #     self.save()

    #     self.user.task_n_completed = timezone.now()
    #     self.user.save()

    def update_completed_at(self):
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.completed and self.completed_at:
            self.completed_at = None

    def save(self, *args, **kwargs):
        self.update_completed_at()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.user.username if self.user else 'No user'}"
