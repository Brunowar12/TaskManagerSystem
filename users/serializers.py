from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils.timezone import now
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password],
        help_text="Password must follow Django's password validation rules"
    )
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())],
        help_text="Email must be unique"
    )

    class Meta:
        model = User
        fields = ["email", "password"]

    def create(self, validated_data):
        user = User(email=validated_data["email"],)
        user.set_password(validated_data["password"])
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(help_text="User email")
    password = serializers.CharField(write_only=True, help_text="User password")

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        user.last_login_at = now()
        user.save(update_fields=["last_login_at"])
        
        token = RefreshToken.for_user(user)
        return {
            "username": user.username,
            "email": user.email,
            "refresh": str(token),
            "access": str(token.access_token),
        }

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email"]
        read_only_fields = ["username"]

class UserProfileSerializer(serializers.ModelSerializer):
    last_profile_edit_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "age",
            "place_of_work",
            "phone_number",
            "last_login_at",
            "last_profile_edit_at",
            "last_task_completed_at",
        ]
        read_only_fields = [
            "last_login_at", 
            "last_profile_edit_at", 
            "last_task_completed_at"]
    
    def update(self, instance, validated_data):
        instance.last_profile_edit_at = now()
        return super().update(instance, validated_data)
