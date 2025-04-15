from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def api_status(request):
    return Response({
        "status": "ok",
        "version": "1.0.0",
        "message": "TaskManager API is up and running"
    })
