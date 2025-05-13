from django.utils import timezone
from rest_framework import serializers
from .models import Task, Category


class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.StringRelatedField(
        source="category.name", read_only=True)
    user_name = serializers.StringRelatedField(
        source="user.username", read_only=True)

    class Meta:
        model = Task
        fields = ["id", "title", "description", "category", "category_name",
            "due_date", "priority", "completed", "is_favorite", "user",
            "user_name", "created_at", "updated_at", "completed_at"]
        read_only_fields = [ "id", "created_at", "updated_at", "user",
            "completed_at", "user_name"]

    def validate_due_date(self, value):
        if value is None:
            raise serializers.ValidationError("Due date cannot be None")
        if value < timezone.now():
            raise serializers.ValidationError(
                "The due date cannot be in the past")
        return value
    
    
class ToggleFavoriteResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    is_favorite = serializers.BooleanField()


class ToggleCompletedResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    completed = serializers.BooleanField()
    completed_at = serializers.DateTimeField(allow_null=True)
    

class MoveTaskSerializer(serializers.Serializer):
    project_id = serializers.IntegerField()


class MoveTaskResponseSerializer(serializers.Serializer):
    status = serializers.CharField()


class CategorySerializer(serializers.ModelSerializer):
    tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "user", "tasks_count"]
        read_only_fields = ["user", "tasks_count"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Category cannot be empty")
        return value

    def get_tasks_count(self, obj):
        return obj.tasks.count()