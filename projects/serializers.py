from django.contrib.auth.models import Permission
from rest_framework import serializers

from .models import Project, Role, ProjectMembership

class ProjectSerializer(serializers.ModelSerializer):
    tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["id", "name", "description", "owner", "tasks_count", "created_at"]
        read_only_fields = ["id", "owner", "tasks_count", "created_at"]

    def get_tasks_count(self, obj):
        return getattr(obj, "tasks_count", 0)

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError(
                "The name of the project cannot be empty"
            )
        if len(value) < 3:
            raise serializers.ValidationError(
                "The project name must contain at least 3 characters"
            )
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        owner = request.user if request else None
        project = self.instance
        existing = Project.objects.filter(owner=owner, name=attrs.get("name"))
        if project:
            existing = existing.exclude(id=project.id)
        if existing.exists():
            raise serializers.ValidationError(
                "You already have a project with this name"
            )
        return attrs


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name"]


class ProjectMembershipSerializer(serializers.ModelSerializer):
    role_name = serializers.StringRelatedField(
        source="role.name", read_only=True
    )
    user_name = serializers.StringRelatedField(
        source="user.username", read_only=True
    )
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = ProjectMembership
        fields = [
            "id", "user", "user_name", "user_details", "project",
            "role", "role_name",
        ]

    def get_user_details(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email,
        }


class ShareLinkSerializer(serializers.Serializer):
    role_id = serializers.IntegerField()
    max_uses = serializers.IntegerField(
        required=False, allow_null=True, min_value=1
    )
    expires_in = serializers.IntegerField(
        default=60, min_value=1,
        help_text="Link duration in minutes (minimum 1 minute)",
    )


class KickUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    
    
class AssignRoleSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    role_id = serializers.IntegerField()