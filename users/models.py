from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.conf import settings

class User(AbstractUser):
    username = models.CharField(max_length=150, blank=True, null=True, unique=True, verbose_name="username")
    age = models.PositiveIntegerField(validators=[MinValueValidator(6), MaxValueValidator(100)], blank=True, null=True, verbose_name="age")
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
            self.username = self.generate_username()
        super().save(*args, **kwargs)

    def generate_username(self):
        # Generate a unique username based on the email address
        base_username = self.email.split('@')[0]
        new_username = base_username
        counter = 1
        while User.objects.filter(username=new_username).exists():
            new_username = f"{base_username}{counter}"
            counter += 1
        return new_username
        
    def __str__(self):
        return self.email

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories")
    
    def __str__(self):
        return self.name