
from .user_authentication_view import CustomJWTAuthentication, IsAuthenticated, TemplateHTMLRenderer
from django.shortcuts import render
from django.contrib.auth.models import User
import datetime
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response

from django.http.response import HttpResponse, JsonResponse
from ..serializer import DatatableSerializer, AuthUserSerializer, UserRegisterationModelSerializer, FilledTemplateDataSerializer
from ..models import query_users_by_args, UserRegisterationModel, WordTemplateNew, query_fill_templates_by_args, FilledTemplateData
from django.db import transaction
from .check_permission import has_permission
import re
import docx2txt
from ..import generate, generateNew
from hr_utility.settings import BASE_DIR
import subprocess


class Dashboard(APIView):
    """
    Get the template for Main Dashboard.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        """ active and inactive users count """

        try:
            print(request.GET['token'], "dashboard")

            today = datetime.date.today() + datetime.timedelta(days=1)
            last_week = datetime.date.today() - datetime.timedelta(days=7)
            new_users = User.objects.filter(
                last_login__isnull=True).filter(is_superuser=False).count()
            recently_looged_users = User.objects.filter(last_login__range=(
                last_week, today)).filter(is_superuser=False).count()
            active_users = new_users + recently_looged_users

            total = User.objects.filter(is_superuser=False).count()
            inactive_users = total - active_users

            return Response({'active': active_users, 'inactive': inactive_users}, template_name="user_authentication/main_dashboard.html")
        except Exception as e:
            print("exception in dashboard", e)

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

    # @has_permission()
    def get(self, request):
        """ active and inactive users count """

        try:
            print("get user management dashboard")

            today = datetime.date.today() + datetime.timedelta(days=1)
            last_week = datetime.date.today() - datetime.timedelta(days=7)
            new_users = User.objects.filter(
                last_login__isnull=True).filter(is_superuser=False).count()
            recently_looged_users = User.objects.filter(last_login__range=(
                last_week, today)).filter(is_superuser=False).count()
            active_users = new_users + recently_looged_users

            total = User.objects.filter(is_superuser=False).count()
            inactive_users = total - active_users
            return render(request, "user_authentication/user_dashboard.html", {'active': active_users, 'inactive': inactive_users})

        except Exception as e:
            print("exception in dashboard", e)

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

    # @has_permission()
    def get(self, request):
        """ active and inactive users count """

        try:
            return render(request, "user_authentication/manage_template_dasboard.html")

        except Exception as e:
            print("exception in dashboard", e)

            info_message = "Unable to get Dashboard"
            print("Unable to get Dashboard", info_message)
            return Response({"success": False, "error": str(info_message)})


class NewPasswordView(APIView):
    """ Get forgot passworrd page """
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        try:
            return render(request, 'user_authentication/forgot_password.html')
        except Exception as e:

            info_message = "Cannot get reset password page"
            print("exception while getting page", e)
            print(info_message)
            return Response({"success": False, "error": str(info_message)})


class GetAllUsersView(APIView):
    """Return filtered Users details from database to display in datatable """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    # @has_permission()
    def get(self, request):

        try:
            datatable_server_processing = query_users_by_args(
                request, **request.query_params)
            serializer = DatatableSerializer(
                datatable_server_processing['items'], many=True)
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
            return JsonResponse({'message': str(info_message)}, status=422)


class UserDatatableView(APIView):
    """Get, Delete and Update user using User Id """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    # @has_permission()
    def get(self, request, pk):
        """Get User details using User Id"""

        try:
            is_user_found = User.objects.filter(id=pk).exists()
            if is_user_found == False:

                info_message = "User Not found"
                print(info_message)
                return JsonResponse({'message': info_message}, status=404)
            user = User.objects.get(id=pk)
            register = UserRegisterationModel.objects.filter(user_name=user.username).values('user_name', 'first_name',
                                                                                             'last_name', 'email',
                                                                                             'user_status', 'role__id')

            info_message = "successfully fetched detail of user from db"
            print(info_message, register)
            return JsonResponse({'message': list(register)})
        except Exception as e:
            print("Exception in getting  all user", e)

            info_message = "Cannot get the data of the user"
            print(info_message)
            return JsonResponse({'message': str(info_message)}, status=422)

    # @has_permission()
    def delete(self, request, pk):
        """Delete user using User Id"""

        try:
            is_user_found = User.objects.filter(id=pk).exists()
            if is_user_found == False:

                info_message = "User Not found"
                print(info_message)
                return JsonResponse({'message': info_message}, status=404)
            user = User.objects.get(id=pk)
            register = UserRegisterationModel.objects.get(
                user_name=user.username)
            try:
                with transaction.atomic():
                    user.delete()
                    register.delete()

                    success_msg = "User {} deleted successfully".format(
                        user.username)
                    print(success_msg)
                    return JsonResponse({'message': success_msg})
            except Exception as e:

                info_message = "Please try again"
                print(info_message)
                print("exception in saving data rollback error", e)
                return JsonResponse({'error': str(info_message)}, status=422)

        except Exception as error:
            print("delete", error)

            info_message = "Internal Server Error"
            print(info_message)
            return JsonResponse({'message': str(info_message)}, status=422)

    # @has_permission()
    def put(self, request, pk):
        """Update user details using User Id"""

        try:
            is_user_found = User.objects.filter(id=pk).exists()
            if is_user_found == False:

                info_message = "User Not found"
                print(info_message)
                return JsonResponse({'message': info_message}, status=404)

            user = User.objects.get(pk=pk)
            edited_user = UserRegisterationModel.objects.get(
                user_name=user.username)

            edit_serializer = UserRegisterationModelSerializer(
                edited_user, data=request.POST)

            auth_user_serializer = AuthUserSerializer(user, data={"username": request.POST['user_name'],
                                                                  "email": request.POST['email']})
            try:
                with transaction.atomic():
                    if(edit_serializer.is_valid()):

                        if(auth_user_serializer.is_valid()):
                            edit_serializer.save()

                            auth_user_instance = auth_user_serializer.save()

                            auth_user_instance.save()

                            success_msg = 'User {} updated successfully'\
                                .format(request.POST['user_name'])
                            return JsonResponse({'message': success_msg})
                        else:

                            info_message = "Internal Server Error"
                            print("serializer error",
                                  auth_user_serializer.errors)
                            print(info_message)
                            return JsonResponse({'message': str(info_message)}, status=422)

                    else:

                        info_message = "Internal Server Error"
                        print("serializer error", edit_serializer.errors)
                        print(info_message)
                        return JsonResponse({'message': str(info_message)}, status=422)
            except Exception as e:
                print("exception in saving data rollback error", e)

                info_message = "Please try again saving the data"
                print(info_message)
                return JsonResponse({'message': str(info_message)}, status=422)

        except Exception as error:

            info_message = "Internal Server Error"
            print(info_message, error)
            return JsonResponse({'message': str(info_message)}, status=422)


class DocumentTeamplateDropdown(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            get_all_template = WordTemplateNew.objects.all()
            print('*'*80)
            print(get_all_template)
            print('*'*80)
            all_template_list = []
            all_template_obj = {}
            for each in get_all_template:
                all_template_obj['id'] = each.id
                all_template_obj['word_name'] = each.word_name
                all_template_obj['word_template'] = each.word_template.file.name
                all_template_list.append(all_template_obj.copy())
            print('-'*80)
            print(all_template_list)
            print('-'*80)
            return JsonResponse({'message': all_template_list})
        except Exception as error:
            info_message = "Internal Server Error"
            print(info_message, error)
            return JsonResponse({'message': str(info_message)}, status=422)


class SelectTemplate(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        try:
            print('='*80)
            print(pk)
            print('='*80)
            template_form = WordTemplateNew.objects.filter(id=pk)
            print(template_form)
            print(template_form[0].word_template)

            text_list = []
            regex = "(?<={{)[^}}]*(?=}})"
            text = docx2txt.process(template_form[0].word_template)
            print(text)
            used = set()
            text_list = [x for x in re.findall(
                regex, text) if x not in used and (used.add(x) or True)]
            print('text_list', text_list)

            test = [
                {"placeholder_list": text_list},
                {'filename': template_form[0].word_template.file.name.split(
                    '/media/')[1]}
            ]
            print('^'*80)
            print(test)
            print('^'*80)
            return JsonResponse(test, safe=False)
        except Exception as e:
            print("Exception in filling templates", e)
            info_message = "Internal Server Error"
            return JsonResponse({'error': str(info_message)}, status=500)


class FillDropdownTemplate(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        """
        Filling the document and convert it into PDF.
        """
        try:
            template_dict = request.POST
            print('^'*80)
            print(template_dict)
            print('^'*80)
            raw_file_name = request.POST['filename']
            new_raw_file_name = uuid.uuid4().hex
            # new_raw_file_name = 'abc'

            if type(template_dict) != dict:
                templatejson = dict(template_dict)

            for k in templatejson:
                if len(templatejson[k]) == 1:
                    templatejson[k] = templatejson[k][0]
            print('templatejson', templatejson)
            print(templatejson['templatename'])
            print(templatejson['Name'])
            new_docx_file_name = new_raw_file_name
            templatejsonnew = {'fill_values': templatejson, 'template_name': templatejson[
                'templatename'], 'employee_name': templatejson['Name'], 'docx_name': new_docx_file_name}
            fill_form_serializer = FilledTemplateDataSerializer(
                data=templatejsonnew)

            if fill_form_serializer.is_valid():
                fill_form_serializer.validated_data['fill_values'] = templatejson
                fill_form_serializer.validated_data['template_name'] = templatejson['templatename']
                fill_form_serializer.validated_data['employee_name'] = templatejson['Name']
                print('<'*40, '>'*80)
                fill_form_serializer.save()
            else:
                print('<'*40, '>'*40)
                print(fill_form_serializer.errors)
                print('<'*40, '>'*40)

            file_name = BASE_DIR + '/media/' + raw_file_name
            print('file_name', file_name)

            document = generateNew.from_template(file_name, templatejson)
            document.seek(0)

            file_name_split = file_name.split('/')[-1].split('.')[0]
            print('file_name_split', file_name_split)

            bytesio_object = document
            dir_path_ft = BASE_DIR + '/media/filled_user_template/'

            print('A'*20)
            with open(dir_path_ft + "{}.docx".format(new_raw_file_name), 'wb') as f:
                f.write(bytesio_object.getbuffer())

            print("1"*20)
            output = subprocess.check_output(
                ['libreoffice', '--convert-to', 'pdf', '{}.docx'.format(new_raw_file_name)], cwd=dir_path_ft)
            print(type(output))

            pdf_file = '/media/filled_user_template/' + \
                '{}.pdf'.format(new_raw_file_name)
            print('pdf_file', pdf_file)
            return JsonResponse({'success': pdf_file})

        except Exception as e:
            print("Exception in filling templates", e)
            info_message = "Internal Server Error"
            return JsonResponse({'error': str(info_message)}, status=500)


class GetAllFillTemplate(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            datatable_server_processing = query_fill_templates_by_args(
                request, **request.query_params)
            serializer = FilledTemplateDataSerializer(
                datatable_server_processing['items'], many=True)
            print('S'*80)
            print(serializer.data)
            print(serializer.data[0]['fill_values']['Name'])
            print('S'*80)
            result = dict()
            result['data'] = serializer.data
            result['draw'] = datatable_server_processing['draw']
            result['recordsTotal'] = datatable_server_processing['total']
            result['recordsFiltered'] = datatable_server_processing['count']
            print("*"*20, "-"*20, "*"*20)
            print(result)
            print("*"*20, "-"*20, "*"*20)
            return Response(result)
        except Exception as e:
            print("Exception in getting  all templates", e)
            info_message = "Cannot fetch all templates data from database"
            print(info_message)
            return JsonResponse({'message': str(info_message)}, status=422)


class GetFillTemplateDetails(APIView):

        def get(self, request, pk):
            try:
                print('10'*50)
                template = FilledTemplateData.objects.get(id = pk)
                print('T'*80)
                print(template)
                print('T'*80)
                
                print(filled_data_details)
                return JsonResponse({'message' : template})
            except Exception as error:
                print("get", error)

                info_message = "Internal Server Error"
                print(info_message)
                return JsonResponse({'message' : str(info_message)},status = 422)
            

        def delete(self, request, pk):
            """Delete template using Template Id"""

            try:
                message = "Template not found"
                status = 404
                template = FilledTemplateData.objects.filter(id = pk)
                if template:
                    template.delete()
                    message = "Template deleted successfully"
                    status = 200
                return JsonResponse({'message' : message},status = status)


            except Exception as error:
                print("delete", error)

                info_message = "Internal Server Error"
                print(info_message)
                return JsonResponse({'message' : str(info_message)},status = 422)
