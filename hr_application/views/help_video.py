from rest_framework.views import APIView
from rest_framework.response import Response
from django.http.response import HttpResponse, JsonResponse
from .user_authentication_view import CustomJWTAuthentication, IsAuthenticated, TemplateHTMLRenderer
from django.shortcuts import render


class GetHelpVideo(APIView):
    """
    Get change password page
    """
    def get(self, request):
        return render(request, 'user_authentication/help_video.html')