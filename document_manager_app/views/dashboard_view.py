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
import os
import docx2txt
from ..import generate, generateNew
from document_manager_project.settings import BASE_DIR
import subprocess
from ..views.user_authentication_view import GetPermissions
from ..config import perms_config
from ..views.check_permission import check_role_permission


class DashboardPageView(APIView):
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        # print(request.session.user_id)
        return Response(template_name="user_authentication/main_dashboard.html")


class Dashboard(APIView):
    """
    Get the template for Main Dashboard.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    @check_role_permission()
    def get(self, request):
        """ active and inactive users count """

        try:
            return Response(template_name="user_authentication/main_dashboard.html")
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

    @check_role_permission()
    def get(self, request):
        """ active and inactive users count """

        try:
            print("get user management dashboard")
            print(request.user)

            today = datetime.date.today() + datetime.timedelta(days=1)
            last_week = datetime.date.today() - datetime.timedelta(days=7)
            new_users = User.objects.filter(
                last_login__isnull=True).count()
            recently_logged_users = User.objects.filter(last_login__range=(
                last_week, today)).count()
            active_users = new_users + recently_logged_users

            total = User.objects.all().count()
            inactive_users = total - active_users
            print("@"*20)
            print(active_users, inactive_users)
            print("@"*20)
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

    check_role_permission()

    def get(self, request):
        """ active and inactive users count """

        try:
            return Response({"success": True}, template_name="user_authentication/manage_template_dasboard.html")

        except Exception as e:
            print("exception in template management dashboard", e)

            info_message = "Unable to get Dashboard"
            print("Unable to get Dashboard", info_message)
            return Response({"success": False, "error": str(info_message)}, template_name="user_authentication/manage_template_dasboard.html")


class GetAllUsersView(APIView):
    """Return filtered Users details from database to display in datatable """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    @check_role_permission()
    def get(self, request):

        try:
            print(request.user)
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

    @check_role_permission()
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

    @check_role_permission()
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
                    # user.delete()
                    register.delete_status = True
                    register.save()

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

    @check_role_permission()
    def put(self, request, pk):
        """Update user details using User Id"""

        try:
            print(request.data['user_name'])
            is_user_found = User.objects.filter(id=pk).exists()
            if is_user_found == False:

                info_message = "User Not found"
                print(info_message)
                return JsonResponse({'message': info_message}, status=404)

            user = User.objects.get(pk=pk)
            edited_user = UserRegisterationModel.objects.get(
                user_name=user.username)
            if user.username != request.data['user_name'] or user.email != request.data['email']:
                print("NOT equal exclude(pk=instance.pk)")
                if User.objects.filter(username=request.data['user_name']).exclude(pk=pk).exists():
                    info_message = "Username already taken!"
                    print(info_message)
                    return JsonResponse({'user_taken_error': info_message}, status=422)
                if User.objects.filter(email=request.data['email']).exclude(pk=pk).exists():
                    info_message = "This Email Id is already registered.!"
                    print(info_message)
                    return JsonResponse({'email_taken_error': info_message}, status=422)
                # return
            edit_serializer = UserRegisterationModelSerializer(
                edited_user, data=request.data)

            auth_user_serializer = AuthUserSerializer(user, data={"username": request.data['user_name'],
                                                                  "email": request.data['email']})
            try:
                with transaction.atomic():
                    if(edit_serializer.is_valid()):

                        if(auth_user_serializer.is_valid()):
                            edit_serializer.save()

                            auth_user_instance = auth_user_serializer.save()

                            auth_user_instance.save()

                            success_msg = 'User {} updated successfully'\
                                .format(request.data['user_name'])
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

    @check_role_permission()
    def get(self, request):
        '''Get list of templates from database'''

        try:
            get_all_template = WordTemplateData.objects.all()
            all_template_list = []
            all_template_obj = {}
            for each in get_all_template:
                all_template_obj['id'] = each.id
                all_template_obj['word_name'] = each.pdf_name
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

    @check_role_permission()
    def get(self, request, pk):
        '''Get placeholders list using template id'''
        try:
            template_form = WordTemplateData.objects.filter(id=pk)
            template_name = template_form[0].pdf_name
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

    @check_role_permission()
    def post(self, request):
        """
        Filling the document and convert it into PDF.
        """

        try:
            template_dict = request.data
            print('T'*80)
            print(template_dict)
            print('T'*80)
            raw_file_name = request.data['filename']
            new_raw_file_name = uuid.uuid4().hex
            print('R'*80)
            print(new_raw_file_name)
            print('R'*80)
            if type(template_dict) != dict:
                templatejson = dict(template_dict)

                for k in templatejson:
                    if len(templatejson[k]) == 1:
                        templatejson[k] = templatejson[k][0]
            else:
                templatejson = template_dict
            print(templatejson['Document_Name'])

            if FilledTemplateData.objects.filter(employee_name=templatejson['Document_Name']).exists():
                info_message = "Document name already taken!"
                print(info_message)
                return JsonResponse({'error': str(info_message)}, status=422)
            save_fill_template = templatejson.pop('save', None)
            print(save_fill_template)
            new_docx_file_name = new_raw_file_name
            templatejsonnew = {'fill_values': templatejson, 'template_name': templatejson[
                'templatename'], 'employee_name': templatejson['Document_Name'], 'docx_name': new_docx_file_name, 'created_by': request.user.id}
            fill_form_serializer = FilledTemplateDataSerializer(
                data=templatejsonnew)

            if fill_form_serializer.is_valid() and (save_fill_template == 'true' or save_fill_template == True):
                fill_form_serializer.validated_data['fill_values'] = templatejson
                fill_form_serializer.validated_data['template_name'] = templatejson['templatename']
                fill_form_serializer.validated_data['employee_name'] = templatejson['Document_Name']
                fill_form_serializer.validated_data['docx_name'] = new_docx_file_name
                fill_form_serializer.validated_data['created_by'] = request.session['user_name']
                fill_form_serializer.save()
                file_name = BASE_DIR + '/media/' + raw_file_name

                document = generateNew.from_template(file_name, templatejson)
                document.seek(0)

                file_name_split = file_name.split('/')[-1].split('.')[0]

                bytesio_object = document
                dir_path_ft = BASE_DIR + '/media/filled_user_template/'
                document_pathname = dir_path_ft + \
                    "{}.docx".format(new_raw_file_name)
                with open(document_pathname, 'wb') as f:
                    f.write(bytesio_object.getbuffer())

                output = subprocess.check_output(
                    ['libreoffice', '--convert-to', 'pdf', '{}.docx'.format(new_raw_file_name)], cwd=dir_path_ft)

                pdf_file = '/media/filled_user_template/' + \
                    '{}.pdf'.format(new_raw_file_name)
                # old_pdf_path = dir_path_ft + \
                #     templatejson['pdfFileName'].split('/')[-1]
                # if os.path.exists(document_pathname):
                #     os.remove(document_pathname)   
                # if os.path.exists(old_pdf_path):
                #     os.remove(old_pdf_path)
                return JsonResponse({"success": "Document {} saved successfully".format(templatejson['Document_Name']), "status": 201})

            file_name = BASE_DIR + '/media/' + raw_file_name

            document = generateNew.from_template(file_name, templatejson)
            document.seek(0)

            file_name_split = file_name.split('/')[-1].split('.')[0]

            bytesio_object = document
            dir_path_ft = BASE_DIR + '/media/filled_user_template/'
            document_pathname = dir_path_ft + \
                "{}.docx".format(new_raw_file_name)
            with open(document_pathname, 'wb') as f:
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

    @check_role_permission()
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

    @check_role_permission()
    def get(self, request, pk):
        '''Get filled template detail using id'''

        try:

            template = FilledTemplateData.objects.filter(
                id=pk).values('fill_values', 'docx_name')

            template_detail = template[0]['fill_values']
            file_name = template_detail['filename']
            template_name = template_detail['templatename']
            pdf_path = '/media/filled_user_template/'+template[0]['docx_name']+'.pdf'
            template_detail.pop('templatename', None)
            template_detail.pop('filename', None)
            template_detail.pop('pdfFileName', None)

            new_template_detail = []
            new_template_detail.append(template_detail)
            new_template_detail.append({'filename': file_name})
            new_template_detail.append({'templatename': template_name})
            new_template_detail.append({'pdfFileName': pdf_path})
            print('*'*80)
            print(new_template_detail)
            print('*'*80)
            return JsonResponse({'message': new_template_detail})
        except Exception as error:
            print("get", error)
            info_message = "Internal Server Error"
            print(info_message)
            return JsonResponse({'message': str(info_message)}, status=422)

    @check_role_permission()
    def delete(self, request, pk):
        """Delete template using Template Id"""

        try:
            template = FilledTemplateData.objects.filter(id=pk)
            print(template[0].docx_name)
            if template:
                try:
                    with transaction.atomic():
                        pdf_path = BASE_DIR + '/media/filled_user_template/'+template[0].docx_name+'.pdf'
                        if os.path.exists(pdf_path):
                            os.remove(pdf_path)
                        template.delete()
                        
                        success_msg = "Document deleted successfully"
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

    @check_role_permission()
    def put(self, request, pk):
        '''update template using template id'''

        try:
            template_dict = request.data

            if type(template_dict) != dict:
                templatejson = dict(template_dict)

                for k in templatejson:
                    if len(templatejson[k]) == 1:
                        templatejson[k] = templatejson[k][0]
            else:
                templatejson = template_dict

            save_fill_template = templatejson.pop('save', None)
            print(save_fill_template)
            print(templatejson)
            edited_template = FilledTemplateData.objects.get(id=pk)
            print(edited_template.employee_name, request.data['Document_Name'])
            if edited_template.employee_name != request.data['Document_Name']:
                if FilledTemplateData.objects.filter(employee_name=request.data['Document_Name']).exclude(pk=pk).exists():
                    info_message = "Document name already taken!"
                    print(info_message)
                    return JsonResponse({'error': str(info_message)}, status=422)
            new_docx_file_name = FilledTemplateData.objects.filter(
                id=pk).values('docx_name')[0]['docx_name']
            templatejsonnew = {'fill_values': templatejson, 'template_name': request.data[
                'templatename'], 'employee_name': request.data['Document_Name'], 'docx_name': new_docx_file_name, 'created_by': request.session['user_name']}

            edit_serializer = FilledTemplateDataSerializer(
                edited_template, data=templatejsonnew)
            print(edit_serializer)
            try:
                with transaction.atomic():
                    if edit_serializer.is_valid() and (save_fill_template == 'true' or save_fill_template == True):
                        edit_serializer.save()
                        print('1'*80)
                        
                        return JsonResponse({"success": "Document {} saved successfully".format(request.data['Document_Name']), "status": 201})

                    file_name = BASE_DIR + '/media/' + request.data['filename']
                    template_dict = request.data
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
                    document_pathname = dir_path_ft + \
                        "{}.docx".format(new_docx_file_name)
                    with open(document_pathname, 'wb') as f:
                        f.write(bytesio_object.getbuffer())

                    output = subprocess.check_output(
                        ['libreoffice', '--convert-to', 'pdf', '{}.docx'.format(new_docx_file_name)], cwd=dir_path_ft)

                    pdf_file = '/media/filled_user_template/' + \
                        '{}.pdf'.format(new_docx_file_name)
                    # os.remove(document_pathname)
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


class CheckDocumentName(APIView):
    """Checks whether username is available."""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    @check_role_permission()
    def post(self, request):

        try:
            jsondata = request.POST
            print(jsondata['document_name'])

            if FilledTemplateData.objects.filter(employee_name=jsondata['document_name']).exists():
                info_message = "Document name already taken!"
                print(info_message)
                return JsonResponse({'message': 'taken', 'toast_msg': str(info_message)})

            else:
                info_message = "Document name Available...!!!"
                print(info_message)
                return JsonResponse({'message': 'not_taken', 'toast_msg': str(info_message)})

        except Exception as e:
            print("exception in check Template name", e)
            info_message = 'Internal server error'
            print(info_message)
            return JsonResponse({'error': str(info_message)}, status=500)
