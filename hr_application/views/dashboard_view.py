from .user_authentication_view import CustomJWTAuthentication, IsAuthenticated, TemplateHTMLRenderer
from django.shortcuts import render
from django.contrib.auth.models import User
import datetime
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http.response import HttpResponse, JsonResponse
from ..serializer import DatatableSerializer, AuthUserSerializer, UserRegisterationModelSerializer, FilledTemplateDataSerializer
from ..models import query_users_by_args, UserRegisterationModel, WordTemplateNew, query_fill_templates_by_args, FilledTemplateData, WordTemplateData
from django.db import transaction
from .check_permission import has_permission
import re
import docx2txt
from ..import generate, generateNew
from hr_utility.settings import BASE_DIR
import subprocess


class DashboardPageView(APIView):
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        return Response(template_name="user_authentication/main_dashboard.html")


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
            print("exception in main dashboard", e)

            info_message = "Unable to get Dashboard"
            print("Unable to get Dashboard", info_message)
            return Response({"success": False, "error": str(info_message)}, template_name="user_authentication/main_dashboard.html")


class UserManagementDashboardPageView(APIView):
    """
    Get user management dashboard
    """
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        print("user management")
        return Response(template_name="user_authentication/user_dashboard.html")


class UserManagementDashboard(APIView):
    """
    Get the template for User Management.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

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
            return Response({'active': active_users, 'inactive': inactive_users}, template_name="user_authentication/user_dashboard.html")

        except Exception as e:
            print("exception in user management dashboard", e)

            info_message = "Unable to get Dashboard"
            print("Unable to get Dashboard", info_message)
            return Response({"success": False, "error": str(info_message)})


class TemplateManagementDashboardPageView(APIView):
    """
    Get template management dashboard
    """
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        print("user management")
        return Response(template_name="user_authentication/manage_template_dasboard.html")


class TemplateManagementDashboard(APIView):
    """
    Get the Dashboard for Template Management.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        """ active and inactive users count """

        try:
            return Response({"success": True}, template_name="user_authentication/manage_template_dasboard.html")

        except Exception as e:
            print("exception in template management dashboard", e)

            info_message = "Unable to get Dashboard"
            print("Unable to get Dashboard", info_message)
            return Response({"success": False, "error": str(info_message)}, template_name="user_authentication/manage_template_dasboard.html")


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
        '''Get list of templates from database'''

        try:
            get_all_template = WordTemplateNew.objects.all()
            all_template_list = []
            all_template_obj = {}
            for each in get_all_template:
                all_template_obj['id'] = each.id
                all_template_obj['word_name'] = each.word_name
                all_template_obj['word_template'] = each.word_template.file.name
                all_template_list.append(all_template_obj.copy())
            return JsonResponse({'message': all_template_list})
        except Exception as error:
            info_message = "Internal Server Error"
            print(info_message, error)
            return JsonResponse({'message': str(info_message)}, status=422)


class SelectTemplate(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        '''Get placeholders list using template id'''
        try:
            template_form = WordTemplateNew.objects.filter(id=pk)
            template_name = template_form[0].word_name
            print('-'*80)
            print(template_name)
            print('-'*80)
            dummy_values = WordTemplateData.objects.filter(
                pdf_name=template_name).values('dummy_values')
            dummy_values_dict = dummy_values[0]['dummy_values']

            dummy_values_dict.pop('filename', None)

            key_list = []
            dummy_values_list = []

            for each in dummy_values_dict.values():
                dummy_values_list.append(each)

            for each in dummy_values_dict.keys():
                key_list.append(each)

            test = [
                {"placeholder_list": key_list},
                {'filename': template_form[0].word_template.file.name.split(
                    '/media/')[1]},
                {
                    'dummy_values': dummy_values_list
                }
            ]
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
            print('T'*80)
            print(template_dict)
            print('T'*80)
            raw_file_name = request.POST['filename']
            new_raw_file_name = uuid.uuid4().hex
            print('R'*80)
            print(new_raw_file_name)
            print('R'*80)
            if type(template_dict) != dict:
                templatejson = dict(template_dict)

            for k in templatejson:
                if len(templatejson[k]) == 1:
                    templatejson[k] = templatejson[k][0]
            save_fill_template = templatejson.pop('save', None)
            print(save_fill_template)
            new_docx_file_name = new_raw_file_name
            templatejsonnew = {'fill_values': templatejson, 'template_name': templatejson[
                'templatename'], 'employee_name': templatejson['Name'], 'docx_name': new_docx_file_name, 'created_by': request.user.id}
            fill_form_serializer = FilledTemplateDataSerializer(
                data=templatejsonnew)

            if fill_form_serializer.is_valid() and save_fill_template == 'true':
                fill_form_serializer.validated_data['fill_values'] = templatejson
                fill_form_serializer.validated_data['template_name'] = templatejson['templatename']
                fill_form_serializer.validated_data['employee_name'] = templatejson['Name']
                fill_form_serializer.validated_data['docx_name'] = new_docx_file_name
                fill_form_serializer.validated_data['created_by'] = request.user.id
                fill_form_serializer.save()
                file_name = BASE_DIR + '/media/' + raw_file_name

                document = generateNew.from_template(file_name, templatejson)
                document.seek(0)

                file_name_split = file_name.split('/')[-1].split('.')[0]

                bytesio_object = document
                dir_path_ft = BASE_DIR + '/media/filled_user_template/'

                with open(dir_path_ft + "{}.docx".format(new_raw_file_name), 'wb') as f:
                    f.write(bytesio_object.getbuffer())

                output = subprocess.check_output(
                    ['libreoffice', '--convert-to', 'pdf', '{}.docx'.format(new_raw_file_name)], cwd=dir_path_ft)

                pdf_file = '/media/filled_user_template/' + \
                    '{}.pdf'.format(new_raw_file_name)
                return JsonResponse({"success": "saved successfully", "status": 201})

            file_name = BASE_DIR + '/media/' + raw_file_name

            document = generateNew.from_template(file_name, templatejson)
            document.seek(0)

            file_name_split = file_name.split('/')[-1].split('.')[0]

            bytesio_object = document
            dir_path_ft = BASE_DIR + '/media/filled_user_template/'

            with open(dir_path_ft + "{}.docx".format(new_raw_file_name), 'wb') as f:
                f.write(bytesio_object.getbuffer())

            output = subprocess.check_output(
                ['libreoffice', '--convert-to', 'pdf', '{}.docx'.format(new_raw_file_name)], cwd=dir_path_ft)

            pdf_file = '/media/filled_user_template/' + \
                '{}.pdf'.format(new_raw_file_name)
            return JsonResponse({'success': pdf_file})

        except Exception as e:
            print("Exception in filling templates", e)
            info_message = "Internal Server Error"
            return JsonResponse({'error': str(info_message)}, status=500)


class GetAllFillTemplate(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        '''Get list of filled template for datatable'''
        try:
            datatable_server_processing = query_fill_templates_by_args(
                request, **request.query_params)
            print(datatable_server_processing)
            serializer = FilledTemplateDataSerializer(
                datatable_server_processing['items'], many=True)

            result = dict()
            result['data'] = serializer.data
            result['draw'] = datatable_server_processing['draw']
            result['recordsTotal'] = datatable_server_processing['total']
            result['recordsFiltered'] = datatable_server_processing['count']
            print(result)
            return Response(result)
        except Exception as e:
            print("Exception in getting  all templates", e)
            info_message = "Cannot fetch all templates data from database"
            print(info_message)
            return JsonResponse({'message': str(info_message)}, status=422)


class GetFillTemplateDetails(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        '''Get filled template detail using id'''

        try:

            template = FilledTemplateData.objects.filter(
                id=pk).values('fill_values')

            template_detail = template[0]['fill_values']
            file_name = template_detail['filename']
            template_name = template_detail['templatename']
            template_detail.pop('templatename', None)
            template_detail.pop('filename', None)

            new_template_detail = []
            new_template_detail.append(template_detail)
            new_template_detail.append({'filename': file_name})
            new_template_detail.append({'templatename': template_name})
            print('*'*80)
            print(new_template_detail)
            print('*'*80)
            return JsonResponse({'message': new_template_detail})
        except Exception as error:
            print("get", error)
            info_message = "Internal Server Error"
            print(info_message)
            return JsonResponse({'message': str(info_message)}, status=422)

    def delete(self, request, pk):
        """Delete template using Template Id"""

        try:
            template = FilledTemplateData.objects.filter(id=pk)
            if template:
                try:
                    with transaction.atomic():
                        template.delete()
                        success_msg = "Template deleted successfully"
                        print(success_msg)
                        return JsonResponse({'message': success_msg})
                except Exception as e:
                    info_message = "Please try again"
                    print(info_message)
                    print("exception in saving data rollback error", e)
                    return JsonResponse({'error': str(info_message)}, status=422)
            else:
                message = 'No Template Found'
                status = 404
            return JsonResponse({'message': message}, status=status)

        except Exception as error:
            print("delete", error)
            info_message = "Internal Server Error"
            print(info_message)
            return JsonResponse({'message': str(info_message)}, status=422)

    def put(self, request, pk):
        '''update template using template id'''

        try:
            template_dict = request.POST

            if type(template_dict) != dict:
                templatejson = dict(template_dict)

            for k in templatejson:
                if len(templatejson[k]) == 1:
                    templatejson[k] = templatejson[k][0]
            save_fill_template = templatejson.pop('save', None)
            print(save_fill_template)
            print(templatejson)
            edited_template = FilledTemplateData.objects.get(id=pk)

            new_docx_file_name = FilledTemplateData.objects.filter(
                id=pk).values('docx_name')[0]['docx_name']
            templatejsonnew = {'fill_values': templatejson, 'template_name': request.POST[
                'templatename'], 'employee_name': request.POST['Name'], 'docx_name': new_docx_file_name, 'created_by' : request.user.id}

            edit_serializer = FilledTemplateDataSerializer(
                edited_template, data=templatejsonnew)
            print(edit_serializer)
            try:
                with transaction.atomic():
                    if edit_serializer.is_valid() and save_fill_template == 'true':
                        edit_serializer.save()
                        print('1'*80)
                        return JsonResponse({"success": "saved successfully", "status": 201})
                    
                    file_name = BASE_DIR + '/media/' + request.POST['filename']
                    template_dict = request.POST
                    if type(template_dict) != dict:
                        templatejson = dict(template_dict)

                    for k in templatejson:
                        if len(templatejson[k]) == 1:
                            templatejson[k] = templatejson[k][0]

                    document = generateNew.from_template(
                        file_name, templatejson)
                    document.seek(0)

                    bytesio_object = document
                    dir_path_ft = BASE_DIR + '/media/filled_user_template/'

                    with open(dir_path_ft + "{}.docx".format(new_docx_file_name), 'wb') as f:
                        f.write(bytesio_object.getbuffer())

                    output = subprocess.check_output(
                        ['libreoffice', '--convert-to', 'pdf', '{}.docx'.format(new_docx_file_name)], cwd=dir_path_ft)

                    pdf_file = '/media/filled_user_template/' + \
                        '{}.pdf'.format(new_docx_file_name)
                    return JsonResponse({'success': pdf_file})
            except Exception as e:
                print("exception in saving data rollback error", e)
                info_message = "Please try again saving the data"
                print(info_message)
                return JsonResponse({'message': str(info_message)}, status=422)
        except Exception as error:
            print("update", error)
            info_message = "Internal Server Error"
            print(info_message)
            return JsonResponse({'message': str(info_message)}, status=422)
