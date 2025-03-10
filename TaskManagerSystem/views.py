import logging
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom handler for exceptions in the API
    """
    response = exception_handler(exc, context)
    
    # Adaptive logging depending on the type of error
    if response is not None:
        if response.status_code >= 500:
            logger.error(f"Server error: {exc}", exc_info=True)
        elif response.status_code >= 400:
            logger.warning(f"Client error: {exc}")
        else:
            logger.info(f"Other exception: {exc}")
    else:
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Handle 404 errors explicitly
    if response is None:
        return Response(
            {"error": "Resource not found", "detail": str(exc)}, 
            status=status.HTTP_404_NOT_FOUND
        )
    # Handle 500 errors
    if response.status_code == 500:
        return Response(
            {"error": "Internal server error. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response