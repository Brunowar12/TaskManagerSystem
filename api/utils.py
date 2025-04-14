from queue import Full
from rest_framework.response import Response
from rest_framework import status

def error_response(message, http_status=status.HTTP_400_BAD_REQUEST):
    """
    Generates a response with the ‘error’ field and the specified HTTP status
    """
    return Response({"error": message}, status=http_status)

def status_response(message, http_status=None):
    """
    Generates a response with the ‘status’ field and the specified HTTP status
    """    
    return Response({"status": message}, status=http_status)