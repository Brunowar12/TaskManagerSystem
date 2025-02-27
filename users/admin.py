from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Category

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
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
    )
    readonly_fields = (
        "last_login_at", 
        "last_profile_edit_at", 
        "last_task_completed_at")

admin.site.register(User, CustomUserAdmin)
admin.site.register(Category)
