import logging
import traceback
from typing import Optional
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def error_response(
    message: Optional[str] = None,
    http_status: int = status.HTTP_400_BAD_REQUEST,
    *,
    exc: Optional[Exception] = None
):
    """
    Generates a generalized Response with the 'error' field.
    If exc is passed, it logs the stack trace on the server
    """
    if exc is not None:
        # Logging of a full stack trade
        logger.error("Internal error: %s\n%s", exc, traceback.format_exc())

    # We return only a general message to the client
    safe_message = message or "An internal server error occurred"
    return Response({"error": safe_message}, status=http_status)


def status_response(message, http_status=None):
    """
    Generates a response with the ‘status’ field and the specified HTTP status
    """
    return Response({"status": message}, status=http_status)
