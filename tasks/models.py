from django.db import models
from django.utils import timezone
from users.models import Category
from django.conf import settings

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('L', 'Low'),
        ('M', 'Medium'),
        ('H', 'High'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)   
    due_date = models.DateTimeField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks")
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, default='M')
    is_favorite = models.BooleanField(default=False, verbose_name="Favorite")
    
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.completed:
            self.completed_at = None
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from datetime import timedelta

# class Reminder(models.Model):
#     task = models.ForeignKey('tasks.Task', on_delete=models.CASCADE)
#     remind_at = models.DateTimeField()
#     is_sent = models.BooleanField(default=False)
    
#     def __str__(self):
#         return f"Reminder for task {self.task.title} at {self.remind_at}"
    
# @receiver(post_save, sender=Task)
# def create_task_reminder(sender, instance, **kwargs):
#     if instance.due_date:
#         remind_at = instance.due_date - timedelta(hours=1)
#         Reminder.objects.create(task=instance, remind_at=remind_at)