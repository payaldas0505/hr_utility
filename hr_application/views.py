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

from .models import UserRegisterationModel, UserRole

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_superuser'] = user.is_superuser
        # token['token_value'] = uuid.uuid4().hex
        # cache.set(token['token_value'], user, timeout=CACHE_TTL)
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
        # token['token_value'] = uuid.uuid4().hex
        # cache.set(token['token_value'], user, timeout=CACHE_TTL)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['username'] = self.user.username
        data['id'] = self.user.id
        data['password'] = self.user.password
        # user=authenticate(username=self.user.username,
        #                   password='payal@1997')
        print("data in validation", data)
        # my_view(self, data)
        return data 

        # if user is not None:
        #     if user.is_active:
        #         login(self, user)
        # print("data in validation", data)
        # role = UserRegisterationModel.objects.filter(user_id=self.user.id).values('role')
        # data['role_id'] = role[0]["role"]

          
def my_view(self, request):
        username = request['username']
        password = 'payal@1997'
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            print("logged in")
        else:
            print("not login")

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

        # payload = token_backend.decode(raw_token, verify=True)
        

        # if payload['token_value'] in cache.keys("*"):
        #     return cache.get(payload['token_value']), validated_token
        # else:
        #     raise InvalidToken()


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

class Dashboard(APIView):
    """
    Get the template for Main Dashboard.
    """
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

            return Response({'active': active_users, 'inactive': inactive_users}, template_name="user_authentication/main_dashboard.html")
        except Exception as e:
            print("exception in dashboard", e)
            # info_message = get_info_messages(get_language, 'dashboard_error')
            info_message = "Unable to get Dashboard"
            print("Unable to get Dashboard", info_message)
            return Response({"success": False, "error": str(info_message)})

class UserManagementDashboard(APIView):
    """
    Get the template for User Management.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        """ active and inactive users count """

        # get_language = set_session_language(request)
        try:
            print("get user management dashboard")
            # print(request.GET['token'],"dashboard")
            today = datetime.date.today() + datetime.timedelta(days=1)
            last_week = datetime.date.today() - datetime.timedelta(days=7)
            new_users = User.objects.filter(last_login__isnull=True).filter(is_superuser=False).count()
            recently_looged_users = User.objects.filter(last_login__range=(last_week, today)).filter(is_superuser=False).count()
            active_users = new_users + recently_looged_users

            total = User.objects.filter(is_superuser=False).count()
            inactive_users = total - active_users
            return render(request, "user_authentication/user_dashboard.html", {'active': active_users, 'inactive': inactive_users})

            # return Response({'active': active_users, 'inactive': inactive_users}, template_name="user_authentication/user_dashboard.html")
        except Exception as e:
            print("exception in dashboard", e)
            # info_message = get_info_messages(get_language, 'dashboard_error')
            info_message = "Unable to get Dashboard"
            print("Unable to get Dashboard", info_message)
            return Response({"success": False, "error": str(info_message)})


class TemplateManagementDashboard(APIView):
    """
    Get the Dashboard for Template Management.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        """ active and inactive users count """

        # get_language = set_session_language(request)
        try:
            print("get templates management dashboard")
        
            return render(request, "user_authentication/manage_template_dasboard.html")

            # return Response({'active': active_users, 'inactive': inactive_users}, template_name="user_authentication/user_dashboard.html")
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
       
class AddUserFormView(APIView):
    """Registration Form."""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        """Renders Registration form."""  
                                              
        # get_language = set_session_language(request)

        try:
            return render(request, 'user_registration/registration_form.html')

        except Exception as e:
            print("Error in getting registeration page:", e)
            # info_message = get_info_messages(get_language, "registration_exception")
            info_message = 'Cannot get the registeration page.'
            print(info_message)
            return  JsonResponse({"error": str(info_message)}, status=500)


class GetRoleDropDown(APIView):
    """Gets qualification dropdown from the database."""
    def get(self, request):
        # get_language = set_session_language(request)

        try:
            get_role= UserRole.objects.all().values('role_no','role_name')
            print('qualification', get_role[0])
            role_list = []
            for role in get_role:
                role_list.append(role)
            print(role_list)
            
            return JsonResponse(role_list, safe=False)
        except Exception as e:
            print("exception in getting label", e)
            # info_message = get_info_messages(get_language, 'role_dropdown_fail')
            info_message = "Cannot fetch Role dropdown from database"
            print(info_message)
            return JsonResponse({"success": False, "error": str(info_message)}, status=404)