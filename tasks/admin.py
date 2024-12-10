from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'due_date', 'priority', 'completed')
    search_fields = ('title', 'description')
    list_filter = ('priority', 'completed', 'due_date', 'user')