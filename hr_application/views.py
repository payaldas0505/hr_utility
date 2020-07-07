from django.shortcuts import render
from rest_framework.views import APIView
from django.http.response import HttpResponse

# Create your views here.
class LoginView(APIView):
    """ Login page """
    
    def get(self, request):
        """ get login page """
        return HttpResponse("Hello")
             
    