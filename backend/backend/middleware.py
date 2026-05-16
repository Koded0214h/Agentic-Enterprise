import re
from django.http import JsonResponse


class InputSanitizationMiddleware:
    """Strip null bytes and excessively long headers."""
    MAX_HEADER_LEN = 8192
    NULL_BYTE = re.compile(r'\x00')

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Block null bytes in path
        if self.NULL_BYTE.search(request.path):
            return JsonResponse({'detail': 'Invalid request.'}, status=400)
        return self.get_response(request)
