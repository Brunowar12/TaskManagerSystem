from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status

@api_view(['GET'])
@permission_classes([AllowAny])
def hello_world(request):
    try:
        return Response({"message": "Hello, World!"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Новая функция для рендеринга HTML
def home(request):
    return render(request, 'main/index.html')
