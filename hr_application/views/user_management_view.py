
from .user_authentication_view import CustomJWTAuthentication, IsAuthenticated, TemplateHTMLRenderer
from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response

from django.http.response import HttpResponse, JsonResponse
from ..models import UserRegisterationModel, UserRole, RolePermissions
from ..forms import UserRegisterationForm, UserForm
from django.contrib.auth.models import User

from django.db import transaction
from .check_permission import has_permission
from ..config.perms_config import perms

class AddUserFormView(APIView):
    """Registration Form."""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    @has_permission('add_user_get')
    def get(self, request):
        """Renders Registration form."""

        try:

            return render(request, 'user_registration/registration_form.html')

        except Exception as e:
            print("Error in getting registeration page:", e)
            info_message = 'Cannot get the registeration page.'
            print(info_message)
            return  JsonResponse({"error": str(info_message)}, status=500)

    @has_permission(perms['add_user_post'])
    def post(self, request):
        """Submits and saves user data into the database."""

        try:

            user_data = request.POST
            print('#'*80)
            print(user_data)
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
            role_name = user_data['role']
            print('A'*80)
            print(auth_data)
            print('A'*80)

            check_register_data = user_data
            _mutable = check_register_data._mutable

            # set to mutable
            check_register_data._mutable = True

            # сhange the values you want
            check_register_data.pop('confirm_password', None)
            check_register_data.pop('password', None)
            check_register_data.pop('role', None)

            check_register_data._mutable = _mutable
            print(check_register_data)
            details = UserRegisterationForm(check_register_data)
            one_user = UserForm(data=auth_data)
            print(details.is_valid)
            print(one_user.is_valid)

            try:
                with transaction.atomic():
                    if details.is_valid() and one_user.is_valid():
                        # Save auth user
                        user = one_user.save(commit=False)
                        user.set_password(auth_data['password'])
                        user.save()
                        # save registered user
                        save_user_data = details.save(commit=False)
                        save_user_data.user = user
                        save_user_data.save()
                        print("role_name", role_name)
                        # m2m saving role in user table
                        save_user_data.role.add(UserRole.objects.get(role_name=role_name))
                        print("user", user)
                        print("save_user_data", save_user_data)
                        print("form is validated")

                        success_msg = 'User {}, have successfully registered.'.format(check_register_data['first_name'])
                        return JsonResponse({'message' : success_msg})
                    else:
                        print(details.errors)
                        print(one_user.errors)
                        info_message = "Invalid data"
                        print(info_message)
                        return JsonResponse({'error' : str(info_message)}, status=500)
            except Exception as e:
                info_message = "Please try again saving the data"
                print(info_message)
                print("exception in saving data rollback error", e)
                return JsonResponse({'error' : str(info_message)}, status=500)


        except Exception as e:
            print("Error in submitting form:", e)
            info_message = "internal_server_error"
            print("sometime went wrong", info_message)
            return JsonResponse({'error': str(info_message) }, status=500)



class GetRoleDropDown(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]
    """Gets qualification dropdown from the database."""
    def get(self, request):

        try:
            get_role= UserRole.objects.filter(role_status=True).all().values('id','role_name')
            print('qualification', get_role[0])
            role_list = []
            for role in get_role:
                role_list.append(role)
            print(role_list)

            return JsonResponse(role_list, safe=False)
        except Exception as e:
            print("exception in getting label", e)
            info_message = "Cannot fetch Role dropdown from database"
            print(info_message)
            return JsonResponse({"success": False, "error": str(info_message)}, status=404)

class CheckUsername(APIView):
    """Checks whether username is available."""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def post(self, request):

        try:
            jsondata = request.POST
            print(jsondata['user_name'])

            if User.objects.filter(username=jsondata['user_name']).exists():
                info_message = "Username already taken!"
                print(info_message)
                return JsonResponse({'message': 'taken', 'toast_msg':str(info_message)})


            else:
                info_message = "Username Available...!!!"
                print(info_message)
                return JsonResponse({'message': 'not_taken', 'toast_msg':str(info_message)})

        except Exception as e:
            print("exception in check username", e)
            info_message = 'Internal server error'
            print(info_message)
            return JsonResponse({'error' : str(info_message)}, status=500)

class CheckEmail(APIView):
    """Checks whether email id is already registered or not."""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def post(self, request):

        try:
            jsondata = request.POST

            if User.objects.filter(email=jsondata['email']).exists():
                info_message = "Email Id  already registered!"
                print(info_message)
                return JsonResponse({'message': 'taken', 'toast_msg': str(info_message)})

            else:
                info_message = "Email Id not registered"
                print(info_message)
                return JsonResponse({'message': 'not_taken', 'toast_msg': str(info_message)})

        except Exception as e:
            info_message = "Internal server error"
            print(info_message, e)
            return JsonResponse({'error' : str(info_message)}, status=500)
