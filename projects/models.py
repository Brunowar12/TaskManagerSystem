# mypy: disable-error-code=var-annotated

import uuid
from django.contrib.auth.models import Permission
from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
from django.utils import timezone

from api.validators import TEXT_FIELD_VALIDATOR


class Project(models.Model):
    name = models.CharField(max_length=128, validators=[TEXT_FIELD_VALIDATOR])
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.name} (Owner: {self.owner.username})"


class Role(models.Model):
    ADMIN, MODERATOR, MEMBER, VIEWER = "Admin", "Moderator", "Member", "Viewer"
    FIXED_ROLES = [ADMIN, MODERATOR, MEMBER, VIEWER]
    
    name = models.CharField(max_length=64, unique=True)
    permissions = models.ManyToManyField(Permission, blank=True)
    
    def clean(self):
        if self.name not in self.FIXED_ROLES:
            raise ValidationError(
                f"Custom roles are not allowed. Use one of: {', '.join(self.FIXED_ROLES)}"
            )
            
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProjectMembership(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_memberships",
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="memberships"
    )
    role = models.ForeignKey(
        Role, on_delete=models.CASCADE, related_name="members"
    )

    class Meta:
        unique_together = ("user", "project")

    def __str__(self):
        return f"{self.user.username} - {self.project.name} ({self.role.name})"


class ProjectShareLink(models.Model):
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="share_links"
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="share_links",
        help_text="Role for invited user",
    )
    max_uses = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum number of uses. Leave blank for unlimited uses",
    )
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        errors = {}
        if self.max_uses is not None and self.max_uses <= 0:
            errors["max_uses"] = "The max_uses value must be a positive number or left blank"
        if self.max_uses is not None and self.used_count > self.max_uses:
            errors["used_count"] = "The number of uses exceeds the set limit"
        if self.expires_at <= timezone.now():
            errors["expires_at"] = "The expiration date must be in the future"

        if errors:
            raise ValidationError(errors)

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def is_usage_exceeded(self):
        return self.max_uses is not None and self.used_count >= self.max_uses

    def is_valid(self):
        return self.is_active and not self.is_expired() and not self.is_usage_exceeded()

    def __str__(self):
        return f"Link to {self.project.name} ({self.role.name})"
