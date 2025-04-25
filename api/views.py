from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def api_status(request):
    return Response({
        "status": "ok",
        "version": getattr(settings, 'API_VERSION', 'dev'),
        "message": "TaskManager API is up and running"
    })
