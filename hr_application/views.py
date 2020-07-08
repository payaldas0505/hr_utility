import datetime
import uuid
from django.contrib.auth.models import User

from django.shortcuts import render
from django.http.response import HttpResponse

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


CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_superuser'] = user.is_superuser
        token['token_value'] = uuid.uuid4().hex
        cache.set(token['token_value'], user, timeout=CACHE_TTL)
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
        token['token_value'] = uuid.uuid4().hex
        cache.set(token['token_value'], user, timeout=CACHE_TTL)
        return token


    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['username'] = self.user.username
        data['id'] = self.user.id
        # role = UserRegisterationModel.objects.filter(user_id=self.user.id).values('role')
        # data['role_id'] = role[0]["role"]

        return data   


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
        payload = token_backend.decode(raw_token, verify=True)


        if payload['token_value'] in cache.keys("*"):
            return cache.get(payload['token_value']), validated_token
        else:
            raise InvalidToken()


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
             
class Dashboard(APIView):
    """shhow active users and inactive users count on dashboard"""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        """ active and inactive users count """
        
        # get_language = set_session_language(request)
        try:
            print(request.GET['token'],"dashboard")
            today = datetime.date.today() + datetime.timedelta(days=1)
            last_week = datetime.date.today() - datetime.timedelta(days=7)
            new_users = User.objects.filter(last_login__isnull=True).filter(is_superuser=False).count()
            recently_looged_users = User.objects.filter(last_login__range=(last_week, today)).filter(is_superuser=False).count()
            active_users = new_users + recently_looged_users

            total = User.objects.filter(is_superuser=False).count()
            inactive_users = total - active_users

            return Response({'active': active_users, 'inactive': inactive_users}, template_name="user_authentication/dashboard.html")
        except Exception as e:
            print("exception in dashboard", e)
            # info_message = get_info_messages(get_language, 'dashboard_error')
            info_message = "Unable to get Dashboard"
            print("Unable to get Dashboard", info_message)
            return Response({"success": False, "error": str(info_message)})


class NewPasswordView(APIView):
    """ Get forgot passworrd page """
    permission_classes = (AllowAny,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        # get_language = set_session_language(request)
        try:
            return render(request, 'user_authentication/forgot_password.html')
        except Exception as e:
            # info_message = get_info_messages(get_language, 'password_page_error')

            info_message = "Cannot get reset password page"
            print("exception while getting page", e)
            print(info_message)
            return Response({"success": False, "error": str(info_message)})