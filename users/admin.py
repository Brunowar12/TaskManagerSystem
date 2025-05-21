from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


class CustomUserAdmin(UserAdmin):
    """Advanced user admin with additional profile fields"""
    fieldsets = list(UserAdmin.fieldsets) + [
        (
            None,
            {
                "fields": (
                    "age",
                    "place_of_work",
                    "phone_number",
                    "last_login_at",
                    "last_profile_edit_at",
                    "last_task_completed_at",
                )
            },
        ),
    ]
    readonly_fields = (
        "last_login_at",
        "last_profile_edit_at",
        "last_task_completed_at",
    )


admin.site.register(User, CustomUserAdmin)
