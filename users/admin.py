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
                    "logged_in",
                    "profile_edited",
                    "task_n_completed",
                )
            },
        ),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Category)
