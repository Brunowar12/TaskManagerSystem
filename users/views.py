from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer
)
from .mixins import GetAuthenticatedUserMixin

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

class LoginView(generics.GenericAPIView):
    """
    API endpoint for user login
    """
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    
class LogoutView(generics.GenericAPIView):
    """"
    API endpoint for user logout
    """
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
    """
    API endpoint for retrieving user profile
    """    
    serializer_class = UserProfileSerializer
    
class UpdateProfileView(GetAuthenticatedUserMixin, generics.UpdateAPIView):
    """
    API endpoint for updating user profile
    """
    serializer_class = UserProfileSerializer