from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    # Перевірка помилки 404
    if response is None:
        return Response(
            {"error": "Resource not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    # Перевірка помилки 500
    if response.status_code == 500:
        return Response(
            {"error": "Internal server error. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response