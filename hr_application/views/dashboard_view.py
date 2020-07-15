
from .user_authentication_view import CustomJWTAuthentication, IsAuthenticated, TemplateHTMLRenderer
from django.shortcuts import render
from django.contrib.auth.models import User
import datetime
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response

from django.http.response import HttpResponse, JsonResponse
from ..serializer import DatatableSerializer, AuthUserSerializer, UserRegisterationModelSerializer
from ..models  import query_users_by_args, UserRegisterationModel
from django.db import transaction
from .check_permission import check_permission

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
            permission_for = "add_user"
            user_id = request.user.id
            permission = check_permission(permission_for, user_id)
            if permission == "granted":
                pass
            else:
                return permission
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
            permission_for = "add_template"
            user_id = request.user.id
            permission = check_permission(permission_for, user_id)
            if permission == "granted":
                pass
            else:
                return permission
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
    permission_classes = (IsAuthenticated,)
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

class GetAllUsersView(APIView):
    """Return filtered Users details from database to display in datatable """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    def get(self, request):

        # get_language = set_session_language(request)

        try:
            datatable_server_processing = query_users_by_args(request, **request.query_params)
            serializer = DatatableSerializer(datatable_server_processing['items'], many=True)
            result = dict()
            result['data'] = serializer.data
            result['draw'] = datatable_server_processing['draw']
            result['recordsTotal'] = datatable_server_processing['total']
            result['recordsFiltered'] = datatable_server_processing['count']
            print("#"*20)
            print(result)
            return Response(result)
        except Exception as e:
            print("Exception in getting  all user", e)
            info_message = "Cannot fetch all users data from database"
            print(info_message)
            return JsonResponse({'message' : str(info_message)}, status = 422)

class EditUserFormView(APIView):
    """Get, Delete and Update user using User Id """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    def get(self, request, pk):
        """Get User details using User Id"""

        # get_language = set_session_language(request)

        try:
            permission_for = "add_user"
            user_id = request.user.id
            permission = check_permission(permission_for, user_id)
            if permission == "granted":
                pass
            else:
                return permission
            is_user_found = User.objects.filter(id = pk).exists()
            if is_user_found == False:
                # info_message = get_info_messages(get_language, 'user_not_found')
                info_message = "User Not found"
                print(info_message)
                return JsonResponse({'message' : info_message},status = 404)
            user = User.objects.get(id = pk)
            register = UserRegisterationModel.objects.filter(user_name = user.username).values\
                                                            ('user_name','first_name',
                                                            'last_name','email',
                                                            'user_status', 'role')
            # info_message = get_info_messages(get_language, 'get_user_error')
            info_message = "Cannot fetch all users data from database"
            print(info_message)
            return JsonResponse({'message' : list(register)})
        except Exception as e :
            print("Exception in getting  all user", e)
            # info_message = get_info_messages(get_language, 'user_data_error')
            info_message = "Cannot get the data of the user"
            print(info_message)
            return JsonResponse({'message' : str(info_message)}, status =422)

    def delete(self, request, pk):
        """Delete user using User Id"""

        # get_language = set_session_language(request)

        try:
            permission_for = "add_user"
            user_id = request.user.id
            permission = check_permission(permission_for, user_id)
            if permission == "granted":
                pass
            else:
                return permission
            is_user_found = User.objects.filter(id = pk).exists()
            if is_user_found == False:
                # info_message = get_info_messages(get_language, 'user_not_found')
                info_message = "User Not found"
                print(info_message)
                return JsonResponse({'message' : info_message},status = 404)
            user = User.objects.get(id = pk)
            register = UserRegisterationModel.objects.get(user_name = user.username)
            try:
                with transaction.atomic():
                    user.delete()
                    register.delete()
                    # info_message = get_info_messages(get_language, 'delete_success')
                    # print("User {} deleted successfully".format(user.username))
                    success_msg = "User {} deleted successfully".format(user.username)
                    print(success_msg)
                    return JsonResponse({'message' : success_msg})
            except Exception as e:
                # info_message = get_info_messages(get_language, 'rollback_error')
                info_message = "Please try again"
                print(info_message)
                print("exception in saving data rollback error", e)
                return JsonResponse({'error' : str(info_message)}, status=422)
            
        except Exception as error:
            print("delete", error)
            # info_message = get_info_messages(get_language, 'internal_server_error')
            info_message = "Internal Server Error"
            print(info_message)
            return JsonResponse({'message' : str(info_message)},status = 422)

    def put(self, request, pk):
        """Update user details using User Id"""

        # get_language = set_session_language(request)

        try:
            permission_for = "add_user"
            user_id = request.user.id
            permission = check_permission(permission_for, user_id)
            if permission == "granted":
                pass
            else:
                return permission
            is_user_found = User.objects.filter(id = pk).exists()
            if is_user_found == False:
                # info_message = get_info_messages(get_language, 'user_not_found')
                info_message = "User Not found"
                print(info_message)
                return JsonResponse({'message' : info_message},status = 404)

            user = User.objects.get(pk = pk)        
            edited_user = UserRegisterationModel.objects.get(user_name = user.username)


            edit_serializer = UserRegisterationModelSerializer(edited_user, data=request.POST)
            # edit_file_serialier = UserRegisterationModelFileSerializer(edited_user, data = request.FILES)
            auth_user_serializer = AuthUserSerializer(user, data = {"username" : request.POST['user_name'],
                                                                    "email" : request.POST['email']})
            try:
                with transaction.atomic():
                    if(edit_serializer.is_valid()):
                        # if(edit_file_serialier.is_valid()):
                            if(auth_user_serializer.is_valid()):
                                edit_serializer.save()                                                                                                                                                    
                                # edit_file_serialier.save()
                                auth_user_instance = auth_user_serializer.save()
                                # auth_user_instance.set_password(auth_user_instance.password)
                                auth_user_instance.save()
                                # info_message = get_info_messages(get_language, 'update_user')
                                # print('User {} updated successfully'.format(request.POST['user_name']))
                                success_msg = 'User {} updated successfully'\
                                                    .format(request.POST['user_name'])
                                return JsonResponse({'message' : success_msg})
                            else:
                                # info_message = get_info_messages(get_language, 'internal_server_error')
                                info_message = "Internal Server Error"
                                print("serializer error", auth_user_serializer.errors)
                                print(info_message)
                                return JsonResponse({'message' : str(info_message)}, status = 422)

                    else:
                        # info_message = get_info_messages(get_language, 'internal_server_error')
                        info_message = "Internal Server Error"
                        print("serializer error", edit_serializer.errors)
                        print(info_message)
                        return JsonResponse({'message' : str(info_message)}, status = 422)
            except Exception as e:
                print("exception in saving data rollback error", e)
                # info_message = get_info_messages(get_language, 'rollback_error')
                info_message = "Please try again saving the data"
                print(info_message)
                return JsonResponse({'message' : str(info_message)}, status=422)  
        except Exception as error:
            # info_message = get_info_messages(get_language, 'internal_server_error')
            info_message = "Internal Server Error"
            print( info_message, error)
            return JsonResponse({'message' : str(info_message)},status = 422)