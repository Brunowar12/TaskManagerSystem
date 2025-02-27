import logging
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.validators import RegexValidator
from users.models import Category

TEXT_FIELD_VALIDATOR = RegexValidator(
    r"^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ0-9_. -]+$",
    "Text can contain letters (latin/cyrillic), numbers, underscores, dots, dashes, and spaces",
)

logger = logging.getLogger(__name__)

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
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, 
        default='M')
    is_favorite = models.BooleanField(default=False, verbose_name="Favorite")

    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['id']  # Sorting by id

    def update_completed_at(self):
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.completed and self.completed_at:
            self.completed_at = None

    def save(self, *args, **kwargs):
        self.update_completed_at()
        
        super().save(*args, **kwargs)
        
        if self.completed:
            try:
                if hasattr(self.user, 'task_n_completed'):
                    self.user.task_n_completed = timezone.now()
                    self.user.save(update_fields=["task_n_completed"])
            except Exception as e:
                logger.error(f"Error updating user task_n_completed: {e}")

    def __str__(self):
        return f"{self.title} - {self.user.username if self.user else 'No user'}"
