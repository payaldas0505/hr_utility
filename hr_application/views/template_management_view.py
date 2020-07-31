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
from ..models import WordTemplateNew
import docx
import os
import subprocess
from wsgiref.util import FileWrapper
import docx2txt
import re
from docxtpl import DocxTemplate
import uuid
from hr_utility.settings import BASE_DIR


class NewGenDocxView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    @has_permission('add_template_GET')
    def get(self, request):
        """Renders Upload document form."""  
        try:
            
            return render(request, 'template_management/add_template.html')
        
        except Exception as e:
            print("Error in getting registeration page:", e)
            info_message = 'Cannot get the registeration page.'
            print(info_message)
            return  JsonResponse({"error": str(info_message)}, status=5)
    
    @has_permission('add_template_POST')
    def post(self,request):
        """Save the upload document and returns the placeholder and filename"""
        try:
            word_serializer = WordTemplateUploadSerializer(data=request.data)
            print('word template', request.data['word_template'])
            print('word template name', request.data['word_name'])
    
            if word_serializer.is_valid():
                new_file_name = 'word_template/'+uuid.uuid4().hex + ".docx"
                word_serializer.validated_data['word_name'] = request.data['word_name']
                word_serializer.validated_data['word_template'].name = new_file_name
                word_serializer.save()

            text_list = []
            regex = "(?<={{)[^}}]*(?=}})"
            text = docx2txt.process(request.data['word_template'])    
            used = set()
            text_list = [x for x in re.findall(regex, text) if x not in used and (used.add(x) or True)]
            print('text_list', text_list)

            test  = [
                        {"placeholder_list" : text_list}, 
                        {'filename' : new_file_name}, 
                        {'word_name': request.data['word_name']}
                    ]

            return JsonResponse(test, safe = False)
        
        except Exception as error:
            info_message = "Internal Server Error"
            print(info_message, error)
            return JsonResponse({'error': str(info_message) }, status=500)

class FillDocument(APIView):
   
    def post(self, request):
        """
        Filling the document and convert it into PDF.
        """
        try:
            template_dict = request.POST
            raw_file_name = request.POST['filename']

            if type(template_dict) != dict:
                templatejson = dict(template_dict)

            for k in templatejson:
                if len(templatejson[k]) == 1:
                    templatejson[k] = templatejson[k][0]  
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
            with open(dir_path_ft + "{}.docx".format(file_name_split),'wb') as f:
                f.write(bytesio_object.getbuffer())

            print("1"*20)
            output = subprocess.check_output(['libreoffice', '--convert-to', 'pdf' , '{}.docx'.format(file_name_split)], cwd=dir_path_ft)
            print(type(output))

            pdf_file = '/media/filled_template/' + '{}.pdf'.format(file_name_split)
            print('pdf_file', pdf_file)
            return JsonResponse({'success': pdf_file }) 
        
        except Exception as e:
            print("Exception in filling templates", e)
            info_message = "Internal Server Error"
            return JsonResponse({'error': str(info_message) }, status=500) 