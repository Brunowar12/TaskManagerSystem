from django.utils.timezone import now
from .models import User
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    username = serializers.CharField(read_only=True)    

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Invalid email address")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use")
        return value

    def create(self, validated_data):
        user = User(email=validated_data["email"],)
        user.set_password(validated_data["password"])
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
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
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "age",
            "place_of_work",
            "phone_number",
            "logged_in",
            "profile_edited",
            "task_n_completed",
        ]
        read_only_fields = ["logged_in", "profile_edited", "task_n_completed"]

    def update(self, instance, validated_data):       
        instance.profile_edited = now()
    
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance