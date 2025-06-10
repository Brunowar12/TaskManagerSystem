from rest_framework import serializers

from .models import Project, ProjectShareLink, Role, ProjectMembership


class ProjectSerializer(serializers.ModelSerializer):
    tasks_count = serializers.SerializerMethodField(read_only=True)
    owner_name: serializers.StringRelatedField = (
        serializers.StringRelatedField(source="owner.username", read_only=True)
    )

    class Meta:
        model = Project
        fields = [
            "id", "name", "description", "owner", "owner_name", "tasks_count", "created_at"
        ]
        read_only_fields = ["id", "owner", "tasks_count", "created_at"]

    def get_tasks_count(self, obj):
        return getattr(obj, "tasks_count", 0)

    def validate_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError(
                "The project name must contain at least 3 characters"
            )
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        name = attrs.get("name")
        qs = Project.objects.filter(owner=user, name__iexact=name)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "You already have a project with this name."
            )
        return attrs


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name"]


class ProjectMembershipSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.username")
    role_name = serializers.ReadOnlyField(source="role.name")
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
    role_id = serializers.IntegerField(default=4, min_value=1, max_value=4)
    max_uses = serializers.IntegerField(
        required=False, allow_null=True, min_value=1
    )
    expires_in = serializers.IntegerField(default=60, min_value=1)


class ProjectShareLinkSerializer(serializers.ModelSerializer):
    role_name = serializers.ReadOnlyField(source="role.name")
    created_by = serializers.ReadOnlyField(source="created_by.username")

    class Meta:
        model = ProjectShareLink
        fields = [
            "id", "token", "role_name",
            "max_uses", "expires_at", "is_active",
            "created_by", "created_at",
        ]
        read_only_fields = [
            "id", "token" ,"role_name", "created_by", "created_at"
        ]


class KickUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()


class AssignRoleSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    role_id = serializers.IntegerField()
