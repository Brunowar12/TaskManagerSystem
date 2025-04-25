from django.conf import settings
from django.http import HttpResponse


class RejectLargeRequestsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.max_length = getattr(settings, 'MAX_REQUEST_BODY_SIZE', 1024 * 1024 * 25)  # 25MB

    def __call__(self, request):
        content_length = request.META.get('CONTENT_LENGTH')
        if content_length is not None:
            try:
                if int(content_length) > self.max_length:
                    return HttpResponse('Payload Too Large', status=413)
            except (ValueError, TypeError):
                pass
        return self.get_response(request)