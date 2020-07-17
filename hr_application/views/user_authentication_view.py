import datetime
import uuid
from django.contrib.auth.models import User

from django.shortcuts import render
from django.http.response import HttpResponse, JsonResponse

from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework import HTTP_HEADER_ENCODING, authentication

from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.state import token_backend
from rest_framework_simplejwt.exceptions import InvalidToken

from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm

from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import views as auth_views
from django.contrib.auth import authenticate, login
from ..models import UserRegisterationModel

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_superuser'] = user.is_superuser

        return token    

    def validate(self, attrs):
        refresh = RefreshToken(attrs['refresh'])
        data = {'access': str(refresh.access_token)}

        if api_settings.ROTATE_REFRESH_TOKENS:
            if api_settings.BLACKLIST_AFTER_ROTATION:
                try:
                    # Attempt to blacklist the given refresh token
                    refresh.blacklist()
                except AttributeError:
                    # If blacklist app not installed, `blacklist` method will
                    # not be present
                    pass

            refresh.set_jti()
            refresh.set_exp()

            data['refresh'] = str(refresh)
    
        return data  

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer
    token_obtain_pair = TokenObtainPairView.as_view() 



class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_superuser'] = user.is_superuser

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['id'] = self.user.id
        data['username'] = self.user.username
        data['password'] = self.user.password

        if User.objects.filter(id=self.user.id).filter(is_superuser=False):
            user_status = UserRegisterationModel.objects.filter(user_id=self.user.id).values('user_status', 'role')
            if user_status[0]['user_status']:
                print("active", user_status[0]['user_status'])
                data['role_id'] = user_status[0]['role']
                
            else:
                print("inactive", user_status[0]['user_status'])
                info_message = "Inactive user"
                data['error'] = info_message
            return data
    
        else:
            data['username'] = self.user.username
            data['role_id'] = 1
            return data
        
        # print("data in validation", data)
        


class CustomJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            header = "Bearer "+request.GET['token']
            header = header.encode(HTTP_HEADER_ENCODING)

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)

        return self.get_user(validated_token), validated_token


    def get_header(self, request):
        """
        Extracts the header containing the JSON web token from the given
        request.
        """
        header= request.META.get('HTTP_AUTHORIZATION')
     
        if isinstance(header, str):
            # Work around django test client oddness
            header = header.encode(HTTP_HEADER_ENCODING)
        return header   
         

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    token_obtain_pair = TokenObtainPairView.as_view()


class LoginView(APIView):
    """ Login page """
    permission_classes = (AllowAny,)
    renderer_classes = [TemplateHTMLRenderer]
    
    def get(self, request):
        """ get login page """

        # get_language = set_session_language(request)
         
        try:
            return render(request, "user_authentication/login.html")     
             
        except Exception as e:
            
            print("exception while showing login page", e)
            # info_message = get_info_messages(get_language, 'login_page_error')
            info_message = "cannot get login page"
            print(info_message)
            return Response({"success": False, "error": str(info_message)})

class LogoutView(APIView):
    """ Logout class """
    authentication_classes = [JWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        """ get login page """

        # get_language = set_session_language(request)
        
        try:
            # info_message = get_info_messages(get_language, 'logout_success')
            info_message = 'You have successfully logged out'
            print(info_message)
            return Response({'data': str(info_message)}, status=204, template_name="user_authentication/login.html")
        except Exception as e:
            print("exception while showing login page", e)
            # info_message = get_info_messages(get_language, 'logout_error')
            info_message = "User Cannot logoutUser Cannot logout"
            print(info_message)
            return Response({"success": False, "error": str(info_message)})



class GetChangePasswordView(APIView):
    """
    Get and render the Change Password Page.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        # get_language = set_session_language(request)
        try:
            return render(request, 'user_authentication/password_change_form.html')
        except Exception as e:
            # info_message = get_info_messages(get_language, 'password_page_error')

            info_message = "Cannot get reset password page"
            print("exception while getting page", e)
            print(info_message)
            return Response({"success": False, "error": str(info_message)})


class SaveChangePasswordView(APIView):
    """
    Check for validation and save the new password.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def post(self, request):
        
        try:
            username = request.user
            old_password = request.data['old_password']
            new_password = request.data['new_password']
            new_password_confirm = request.data['new_password_confirm']
            print(old_password)
            print(new_password)
            print(new_password_confirm)

            if new_password != new_password_confirm:
                info_message = "New password and confirm password fields do not match"
                return JsonResponse({"success": False, 'error': str(info_message)}, status=500)

            user = User.objects.get(username=username)
            
            if user.check_password(old_password):
                user.set_password(new_password)
                user.save()
                print("success")
                info_message = "Password is successfully reset"
                return JsonResponse({'data': str(info_message)})
            
            else:
                info_message = "Your old password is entered  wrong"
                return JsonResponse({"success": False, "error": str(info_message)}, status=500)

        except Exception as e:
            info_message = "Internal server error"
            print(info_message, e)
            return JsonResponse({"success": False, "error": str(info_message)}, status=500) 
       
