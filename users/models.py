from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.db import models, transaction
from django.conf import settings

class User(AbstractUser):
    username = models.CharField(max_length=80, unique=True, verbose_name="username",
        validators=[
            RegexValidator(
                r"^[a-zA-Z0-9_.-]+$",
                "The username can contain only letters, numbers, underscores, periods and hyphens",
            )],)
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(6), MaxValueValidator(100)],
        blank=True, null=True, verbose_name="age",)
    email = models.EmailField(unique=True, verbose_name="email")
    place_of_work = models.CharField(max_length=256,blank=True,
        validators=[
            RegexValidator(
                r"^[a-zA-Z0-9_. -]+$",
                "Place of work can only contain letters, numbers, underscores, dots, dashes and spaces",
            )],
        verbose_name="place of work",)
    phone_number = models.CharField(max_length=15, blank=True, verbose_name="phone number",
        validators=[
            RegexValidator(
                r"^\+\d+$",
                "The phone number must start with '+' and contain only digits after it",
            )],)

    # add logic for these fields
    logged_in = models.DateTimeField(blank=True, null=True, verbose_name="last login")
    profile_edited = models.DateTimeField(
        blank=True, null=True, verbose_name="last profile edit")
    task_n_completed = models.DateTimeField(
        blank=True, null=True, verbose_name="last task completed")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.generate_username()
        super().save(*args, **kwargs)

    @transaction.atomic
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
    name = models.CharField(max_length=20,
        validators=[
            RegexValidator(
                r"^[a-zA-Z0-9_.-]+$",
                "The category name can contain only letters, numbers, underscores periods and hyphens",
            )],)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories")

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.name} (User: {self.user.username})"
