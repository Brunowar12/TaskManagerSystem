from django.shortcuts import render
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer
)
from .mixins import GetAuthenticatedUserMixin

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            raise NotAuthenticated(detail=serializer.errors)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    
class LogoutView(generics.GenericAPIView): # Потрібно доробити, зараз не працює як треба
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error":"Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message":"Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error":str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(GetAuthenticatedUserMixin, generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
class UpdateProfileView(GetAuthenticatedUserMixin, generics.UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

def auth_page(request):
    from django.views.decorators.csrf import csrf_protect
    @csrf_protect
    def render_protected(request):
        return render(request, "auth/index.html")
    return render_protected(request)