from .user_authentication_view import CustomJWTAuthentication, IsAuthenticated, TemplateHTMLRenderer
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http.response import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.db import transaction
from django.core.files import File
from ..import generate, generateNew
from .check_permission import has_permission
from django.core.files.storage import FileSystemStorage
import json
from ..serializer import WordTemplateUploadSerializer, WordTemplateDetailsSerializer
from ..models import query_templates_by_args, WordTemplateNew, WordTemplateData
import docx
import os
import subprocess
from wsgiref.util import FileWrapper
import docx2txt
import re
from docxtpl import DocxTemplate
import uuid
from document_manager_project.settings import BASE_DIR


class AddTemplatePageView(APIView):
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        return render(request, 'template_management/add_template.html')


class NewGenDocxView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request):
        """Renders Upload document form."""
        try:

            return render(request, 'template_management/add_template.html')

        except Exception as e:
            print("Error in getting registeration page:", e)
            info_message = 'Cannot get the registeration page.'
            print(info_message)
            return JsonResponse({"error": str(info_message)}, status=500)

    def post(self, request):
        """Save the upload document and returns the placeholder and filename"""
        try:
            word_serializer = WordTemplateUploadSerializer(data=request.data)
            # print('word template', request.data['word_template'])
            # print('word template name', request.data['word_name'])
            # print("type of file", type(request.data['word_name']))
            if WordTemplateData.objects.filter(pdf_name=request.data['word_name']).exists():
                info_message = "Template name already taken!"
                # print(info_message)
                return JsonResponse({'error': str(info_message)}, status=422)
            if word_serializer.is_valid():
                new_file_name = 'word_template/'+uuid.uuid4().hex + ".docx"
                word_serializer.validated_data['word_name'] = request.data['word_name']
                word_serializer.validated_data['word_template'].name = new_file_name
                word_serializer.save()
            else:
                print(word_serializer.errors)
            text_list = []
            regex = "(?<={{)[^}}]*(?=}})"
            text = docx2txt.process(request.data['word_template'])
            # print("text", text)
            used = set()
            text_list = [x.strip() for x in re.findall(
                regex, text) if x not in used and (used.add(x) or True)]
            # print('text_list', text_list)
            if len(text_list) <= 0:
                return JsonResponse({"error": "There are no fields in this template. Please check the content of the file and upload it again."}, safe=False, status=400)
            test = [
                {"placeholder_list": text_list},
                {'filename': new_file_name},
                {'word_name': request.data['word_name']}
            ]

            return JsonResponse(test, safe=False)

        except Exception as error:
            info_message = "Internal Server Error. Please check the content of the file and upload it again."
            print(info_message, error)
            return JsonResponse({'error': str(info_message)}, status=500)


class FillDocument(APIView):

    def post(self, request):
        """
        Filling the document and convert it into PDF.
        """
        try:
            print("request", request)
            print("request", request.data)
            template_dict = request.data

            raw_file_name = request.data['filename']
            print('raw_file_name', raw_file_name)
            if type(template_dict) != dict:
                templatejson = dict(template_dict)

                for k in templatejson:
                    if len(templatejson[k]) == 1:
                        templatejson[k] = templatejson[k][0]
            else:
                templatejson = template_dict
            print('templatejson', templatejson)

            file_name = BASE_DIR + '/media/' + raw_file_name
            print('file_name', file_name)

            document = generateNew.from_template(file_name, templatejson)
            document.seek(0)

            file_name_split = file_name.split('/')[-1].split('.')[0]
            print('file_name_split', file_name_split)

            bytesio_object = document
            dir_path_ft = BASE_DIR + '/media/filled_template/'

            print('A'*20)
            with open(dir_path_ft + "{}.docx".format(file_name_split), 'wb') as f:
                f.write(bytesio_object.getbuffer())

            print("1"*20)
            output = subprocess.check_output(
                ['libreoffice', '--convert-to', 'pdf', '{}.docx'.format(file_name_split)], cwd=dir_path_ft)
            print(type(output))

            pdf_file = '/media/filled_template/' + \
                '{}.pdf'.format(file_name_split)

            if templatejson['save'] == "true" or templatejson['save'] == True:
                pdf_name = templatejson['document']
                keys = ['save', 'document']
                {templatejson.pop(k) for k in keys}
                new_file_name = 'filled_template/'+file_name_split + ".pdf"
                WordTemplateData.objects.create(
                    pdf_name=pdf_name,
                    dummy_values=templatejson,
                    pdf=new_file_name,
                    word_template=raw_file_name
                )
                return JsonResponse({"success": "Saved successfully", "status": 201})
            print('pdf_file', pdf_file)
            return JsonResponse({'success': pdf_file, 'message': "Template is filled successfully", 'status': 200})

        except Exception as e:
            print("Exception in filling templates", e)
            info_message = "Internal Server Error"
            return JsonResponse({'error': str(info_message)}, status=500)


class GetAllTemplatesView(APIView):
    """Return filtered Users details from database to display in datatable """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            datatable_server_processing = query_templates_by_args(
                request, **request.query_params)
            print('1'*80)
            serializer = WordTemplateDetailsSerializer(
                datatable_server_processing['items'], many=True)
            result = dict()
            print('2'*80)
            result['data'] = serializer.data
            result['draw'] = datatable_server_processing['draw']
            result['recordsTotal'] = datatable_server_processing['total']
            result['recordsFiltered'] = datatable_server_processing['count']
            print("#"*20)
            print(result)
            return Response(result)
        except Exception as e:
            print("Exception in getting  all templates", e)
            info_message = "Cannot fetch all templates data from database"
            print(info_message)
            return JsonResponse({'message': str(info_message)}, status=422)


class WordTemplateDataView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)

    def delete(self, request, pk):
        """Delete template using Template Id"""

        try:
            message = "Template not found"
            status = 404
            template = WordTemplateData.objects.get(id=pk)
            template_new = WordTemplateNew.objects.filter(
                word_name=template.pdf_name)
            if template:
                template.delete()
                if template_new:
                    template_new.delete()
                message = "Template deleted successfully"
                status = 200
            return JsonResponse({'message': message}, status=status)

        except Exception as error:
            print("delete", error)

            info_message = "Internal Server Error"
            print(info_message)
            return JsonResponse({'message': str(info_message)}, status=422)


class CheckWordname(APIView):
    """Checks whether username is available."""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def post(self, request):

        try:
            jsondata = request.POST
            print(jsondata['word_name'])

            if WordTemplateData.objects.filter(pdf_name=jsondata['word_name']).exists():
                info_message = "Template name already taken!"
                print(info_message)
                return JsonResponse({'message': 'taken', 'toast_msg': str(info_message)})

            else:
                info_message = "Template name Available...!!!"
                print(info_message)
                return JsonResponse({'message': 'not_taken', 'toast_msg': str(info_message)})

        except Exception as e:
            print("exception in check Template name", e)
            info_message = 'Internal server error'
            print(info_message)
            return JsonResponse({'error': str(info_message)}, status=500)
