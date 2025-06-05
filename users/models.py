# mypy: disable-error-code=var-annotated

from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models, transaction
from django.utils.crypto import get_random_string

from api.validators import (
    USERNAME_VALIDATOR,
    TEXT_FIELD_VALIDATOR,
    PHONE_NUMBER_VALIDATOR,
)


class User(AbstractUser):
    """
    Custom user model extending AbstractUser:
    - uses email as USERNAME_FIELD
    - automatically generates a unique username if not specified
    - contains additional dates and profile fields
    """
    
    username = models.CharField(
        max_length=80,
        unique=True,
        verbose_name="username",
        validators=[USERNAME_VALIDATOR],
    )
    email = models.EmailField(
        unique=True,
        verbose_name="email",
        help_text="Email must be unique and is used for login",
    )
    age = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(6), MaxValueValidator(100)],
        verbose_name="age",
        help_text="Age must be between 6 and 100 years",
    )
    place_of_work = models.CharField(
        max_length=256,
        blank=True,
        validators=[TEXT_FIELD_VALIDATOR],
        verbose_name="place of work",
    )
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        validators=[PHONE_NUMBER_VALIDATOR],
        verbose_name="phone number",
    )
    last_login_at = models.DateTimeField(
        blank=True, null=True, verbose_name="last login"
    )
    last_profile_edit_at = models.DateTimeField(
        blank=True, null=True, verbose_name="last profile edit"
    )
    last_task_completed_at = models.DateTimeField(
        blank=True, null=True, verbose_name="last task completed"
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def save(self, *args, **kwargs):
        """ 
        When creating a user, if the username is not specified, 
        we generate it based on email 
        """
        if self.email:
            self.email = self.email.lower()
            
        if not self.pk and not self.username:
            self.username = self.generate_username()
            
        super().save(*args, **kwargs)

    @transaction.atomic
    def generate_username(self):
        """
        Forms the base part from email (up to "@"), shortens it to max_length-10
        If such a username exists, adds a random suffix of length 10
        """
        base_username = self.email.split("@", 1)[0]
        max_base_length = self._meta.get_field('username').max_length - 10
        base_username = base_username[:max_base_length]
        
        new_username = base_username

        while User.objects.filter(username=new_username).select_for_update().exists():
            random_suffix = get_random_string(length=10)
            new_username = f"{base_username}{random_suffix}"
            
        return new_username

    def __str__(self):
        return self.email