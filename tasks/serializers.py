from django.utils import timezone
from rest_framework import serializers
from users.models import Category
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", "description", "category", "due_date", "priority", 
                  "completed", "is_favorite", "user", "created_at", "updated_at",]
        read_only_fields = ["id", "created_at", "updated_at", "user"]

    def validate_due_date(self, value):
        if value is None:
            raise serializers.ValidationError("Due date cannot be None")
        if value < timezone.now():
            raise serializers.ValidationError("The due date cannot be in the past")
        return value

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "user"]
        read_only_fields = ["user"]
        
    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Category cannot be empty")
        return value