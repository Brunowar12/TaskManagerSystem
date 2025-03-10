from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models, transaction
from django.utils.crypto import get_random_string
from .validators import USERNAME_VALIDATOR, TEXT_FIELD_VALIDATOR, PHONE_NUMBER_VALIDATOR

class User(AbstractUser):
    username = models.CharField(max_length=80, 
        unique=True, 
        verbose_name="username", 
        validators=[USERNAME_VALIDATOR])
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(6), MaxValueValidator(100)],
        blank=True, null=True, verbose_name="age", 
        help_text="Age must be between 6 and 100 years")
    email = models.EmailField(unique=True, verbose_name="email")
    place_of_work = models.CharField(max_length=256, blank=True,
        validators=[TEXT_FIELD_VALIDATOR],
        verbose_name="place of work",)
    phone_number = models.CharField(max_length=15, blank=True, 
        verbose_name="phone number", validators=[PHONE_NUMBER_VALIDATOR])
    last_login_at = models.DateTimeField(blank=True, null=True, 
        verbose_name="last login")
    last_profile_edit_at = models.DateTimeField(blank=True, null=True, 
        verbose_name="last profile edit")
    last_task_completed_at = models.DateTimeField(blank=True, null=True, 
        verbose_name="last task completed")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if not self.pk and not self.username:
            self.username = self.generate_username()
        super().save(*args, **kwargs)

    @transaction.atomic
    def generate_username(self):
        base_username = self.email.split('@')[0] 
        new_username = base_username      
         
        while User.objects.filter(username=new_username).select_for_update().exists():
            random_suffix = get_random_string(length=10)
            new_username = f"{base_username}{random_suffix}"
        return new_username

    def __str__(self):
        return self.email