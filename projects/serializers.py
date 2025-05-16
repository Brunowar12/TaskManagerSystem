from rest_framework import serializers
from rest_framework.reverse import reverse

from .models import Project, ProjectShareLink, Role, ProjectMembership

class ProjectSerializer(serializers.ModelSerializer):
    tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "name", "description", "owner", "tasks_count", "created_at"
        ]
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
    role_name: serializers.StringRelatedField = serializers.StringRelatedField(
        source="role.name", read_only=True
    )
    user_name: serializers.StringRelatedField = serializers.StringRelatedField(
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


class ShareLinkCreateSerializer(serializers.Serializer):
    role_id = serializers.IntegerField(
        required=False, default=4, min_value=1, max_value=4
    )
    max_uses = serializers.IntegerField(
        required=False, allow_null=True, min_value=1
    )
    expires_in = serializers.IntegerField(default=60, min_value=1)


class ProjectShareLinkSerializer(serializers.ModelSerializer):
    role_name: serializers.StringRelatedField = serializers.StringRelatedField(
        source="role.name", read_only=True
    )
    created_by: serializers.StringRelatedField = (
        serializers.StringRelatedField(
            source="created_by.username", read_only=True
        )
    )
    token = serializers.CharField(write_only=True)
    share_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectShareLink
        fields = [
            "id", "token", "share_url", "role_name",
            "max_uses", "expires_at", "is_active",
            "created_by", "created_at",
        ]
        read_only_fields = ["share_url", "role_name", "created_by", "created_at"]

    def get_share_url(self, obj):
        request = self.context.get("request")
        url = reverse("join-project", kwargs={"token": obj.token}, request=request)
        return url

class KickUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()


class AssignRoleSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    role_id = serializers.IntegerField()