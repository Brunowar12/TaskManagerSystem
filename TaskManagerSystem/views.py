import logging
from rest_framework import status
from rest_framework.views import exception_handler

from api.utils import error_response

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
        return error_response(
            "Internal server error. Please try again later",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
