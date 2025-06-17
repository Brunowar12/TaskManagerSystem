from django.utils import timezone
from rest_framework import serializers

from .models import Task, Category


class TaskSerializer(serializers.ModelSerializer):
    category_name: serializers.CharField = (
        serializers.CharField(source="category.name", read_only=True)
    )
    user_name: serializers.CharField = serializers.CharField(
        source="user.username", read_only=True
    )
    completed_by = serializers.SerializerMethodField()
    completed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "category", "category_name",
            "due_date", "priority", "completed", "is_favorite", "user",
            "user_name", "created_at", "updated_at", "completed_at",
            "completed_by", "completed_by_name"
        ]
        read_only_fields = [
            "id", "created_at", "updated_at", "user",
            "completed_at", "user_name", "completed_by", "completed_by_name"
        ]

    def validate_due_date(self, value):
        if value is None:
            raise serializers.ValidationError("Due date cannot be None")
        if value < timezone.now():
            raise serializers.ValidationError(
                "The due date cannot be in the past"
            )
        return value

    @staticmethod
    def get_completed_by(obj):
        return getattr(obj.completed_by, "id", None)

    @staticmethod
    def get_completed_by_name(obj):
        return getattr(obj.completed_by, "username", None)


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
    user_name: serializers.CharField = serializers.CharField(
        source="user.username", read_only=True
    )

    class Meta:
        model = Category
        fields = ["id", "name", "user", "user_name", "tasks_count"]
        read_only_fields = ["user", "user_name", "tasks_count"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Category cannot be empty")
        return value

    @staticmethod
    def get_tasks_count(obj):
        return getattr(obj, "tasks_count", obj.tasks.count())
