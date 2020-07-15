
from .user_authentication_view import CustomJWTAuthentication, IsAuthenticated, TemplateHTMLRenderer
from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response

from django.http.response import HttpResponse, JsonResponse
from ..models import UserRegisterationModel, UserRole, LevelModel
from ..forms import UserRegisterationForm, UserForm
from django.contrib.auth.models import User

from django.db import transaction
from .check_permission import check_permission

class AddUserFormView(APIView):
    """Registration Form."""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    
    def get(self, request):
        """Renders Registration form."""  

        try:
            permission_for = "add_user"
            user_id = request.user.id
            permission = check_permission(permission_for, user_id)
            if permission == "granted":
                return render(request, 'user_registration/registration_form.html')
            return permission

        except Exception as e:
            print("Error in getting registeration page:", e)
            # info_message = get_info_messages(get_language, "registration_exception")
            info_message = 'Cannot get the registeration page.'
            print(info_message)
            return  JsonResponse({"error": str(info_message)}, status=500)
    
    def post(self, request):
        """Submits and saves user data into the database."""

        # get_language = set_session_language(request)

        try:
            permission_for = "add_user"
            user_id = request.user.id
            permission = check_permission(permission_for, user_id)
            if permission == "granted":
                pass
            else:
                return permission
            user_data = request.POST
            user_file = request.FILES
            print('#'*80)
            print(user_data)
            print('#'*80)
            print(user_file)
            print('#'*80)
            if User.objects.filter(username=user_data['user_name']).exists():
                info_message = "Username already taken!"
                print(info_message)
                return JsonResponse({'message' : info_message})
            
            auth_data = {
                "username" : user_data['user_name'],
                "email" : user_data['email'],
                "password" : user_data['password']
            }

            print('A'*80)
            print(auth_data)
            print('A'*80)
           
            check_register_data = user_data
            _mutable = check_register_data._mutable

            # set to mutable
            check_register_data._mutable = True

            # сhange the values you want
            check_register_data.pop('password', None)
         
          
            check_register_data._mutable = _mutable
            print(check_register_data)
            details = UserRegisterationForm(check_register_data, request.FILES)
            one_user = UserForm(data=auth_data)
            print(details.is_valid)
            print(one_user.is_valid)

            try:
                with transaction.atomic():
                    if details.is_valid() and one_user.is_valid(): 
                        user = one_user.save(commit=False)
                        user.set_password(auth_data['password'])
                        user.save()
                        user_data = details.save(commit=False)
                        user_data.user = user
                        user_data.save()
                        print("user", user)
                        print("user_data", user_data)
                        print("form is validated")
            
                        success_msg = 'User {}, have successfully registered.'.format(check_register_data['first_name'])
                        return JsonResponse({'message' : success_msg})
                    else:
                        print(details.errors)
                        print(one_user.errors)
                        info_message = "Invalid data"
                        # info_message = get_info_messages(get_language, "register_data_invalid")
                        print(info_message)
                        return JsonResponse({'error' : str(info_message)}, status=500)
            except Exception as e:
                info_message = "Please try again saving the data"
                # info_message = get_info_messages(get_language, "rollback_error")
                print(info_message)
                print("exception in saving data rollback error", e)
                return JsonResponse({'error' : str(info_message)}, status=500)

        
        except Exception as e:
            print("Error in submitting form:", e)
            info_message = "internal_server_error"
            # info_message = get_info_messages(get_language, "internal_server_error")
            print("sometime went wrong", info_message)
            return JsonResponse({'error': str(info_message) }, status=500)



class GetRoleDropDown(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]
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

class CheckUsername(APIView):
    """Checks whether username is available."""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def post(self, request):

        # get_language = set_session_language(request)
        try:
            jsondata = request.POST
            print(jsondata['user_name'])
            try:
                if User.objects.filter(username=jsondata['user_name']).exists():
                    # info_message = get_info_messages(get_language, 'username_exception')
                    info_message = "Username already taken!"
                    print(info_message)
                    return JsonResponse({'message': 'taken', 'toast_msg':str(info_message)})
            except Exception as e:
                print("username except", e)
                info_message = 'Internal server error'
                print(info_message)
                return JsonResponse({'error' : str(info_message)}, status=500)
            else:
                # info_message = get_info_messages(get_language, "username_success")
                info_message = "Username Available...!!!"
                print(info_message)
                return JsonResponse({'message': 'not_taken', 'toast_msg':str(info_message)})
        except Exception as e:
            print("exception in check username", e)
            # info_message = get_info_messages(get_language, 'internal_server_error')
            info_message = 'Internal server error'
            print(info_message)
            return JsonResponse({'error' : str(info_message)}, status=500)

class CheckEmail(APIView):
    """Checks whether email id is already registered or not."""

    def post(self, request):

        # get_language = set_session_language(request)
        try:
            jsondata = request.POST

            if User.objects.filter(email=jsondata['email']).exists():
                info_message = "Email Id  already registered!"
                # info_message = get_info_messages(get_language, "email_exception")
                print(info_message)
                return JsonResponse({'message': 'taken', 'toast_msg': str(info_message)})
            else:
                # info_message = get_info_messages(get_language, 'email_success')
                info_message = "Email Id not registered"
                print(info_message)
                return JsonResponse({'message': 'not_taken', 'toast_msg': str(info_message)})
        except Exception as e:
            # info_message = get_info_messages(get_language, 'internal_server_error')
            info_message = "Internal server error"
            print(info_message, e)
            return JsonResponse({'error' : str(info_message)}, status=500)


class GetPermissions(APIView):
    """Get Permissons of user"""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    def post(self, request):
        # get_language = set_session_language(request)
        
        try:
            jsondata = request.data
            user_role_id =jsondata['user_role_id']
            print("#"*20)
            print(user_role_id)
            print("#"*20)

            if User.objects.filter(id=request.user.id).filter(is_superuser=True):
                perms = LevelModel.objects.filter(level_id = 1)\
                        .values('add_user', 'add_template')
                perms_dict = perms[0]
                print("2"*20,perms_dict)
                return JsonResponse(perms_dict)

            perms = LevelModel.objects.filter(level_id = user_role_id)\
                    .values('add_user', 'add_template')
            perms_dict = perms[0]
            print("5"*20, perms_dict)

            return JsonResponse(perms_dict)
        except Exception as error:
            info_message = "Permission fetching  issue due to Internal Server Error"
            # info_message = get_info_messages(get_language, 'get_permission_error')
            print( info_message, error)
            return JsonResponse({'message' : str(info_message)},status = 422)

