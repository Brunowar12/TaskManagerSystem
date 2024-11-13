from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
    username = models.CharField(max_length=150, blank=True, null=True, unique=True, verbose_name="username")
    age = models.PositiveIntegerField(blank=True, null=True, verbose_name="age")
    email = models.EmailField(unique=True, verbose_name="email")
    place_of_work = models.CharField(max_length=256, blank=True, verbose_name="place of work")
    phone_number = models.CharField(max_length=15, blank=True, verbose_name="phone number")

    logged_in = models.DateTimeField(blank=True, null=True, verbose_name="last login")
    profile_edited = models.DateTimeField(blank=True, null=True, verbose_name="last profile edit")
    task_n_completed = models.DateTimeField(blank=True, null=True, verbose_name="last task completed")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email.split('@')[0]
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.email

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories")
    
    def __str__(self):
        return self.name