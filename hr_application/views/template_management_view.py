from .user_authentication_view import CustomJWTAuthentication, IsAuthenticated, TemplateHTMLRenderer
from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response

from django.http.response import HttpResponse, JsonResponse

from django.contrib.auth.models import User

from django.db import transaction

from ..import generate, generateNew
from .check_permission import has_permission
from django.core.files.storage import FileSystemStorage
import json
from ..serializer import WordTemplateNewSerializer
from ..models import WordTemplateData
import docx
import os
import subprocess
from wsgiref.util import FileWrapper
import docx2txt
import re
from docxtpl import DocxTemplate
import uuid


class NewGenDocxView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    @has_permission('add_template_GET')
    def get(self, request):
        """Renders Registration form."""  
        try:
            
            return render(request, 'template_management/add_template.html')
        
        except Exception as e:
            print("Error in getting registeration page:", e)
            info_message = 'Cannot get the registeration page.'
            print(info_message)
            return  JsonResponse({"error": str(info_message)}, status=5)
    
    @has_permission('add_template_POST')
    def post(self,request):

        try:
            word_serializer = WordTemplateNewSerializer(data=request.data)
            print(request.data['word_template'])
            if word_serializer.is_valid():
                word_serializer.save()
                new_file_name = 'media/word_template/'+uuid.uuid4().hex + ".docx"
                os.rename('media/word_template/'+request.data['word_template'].name, new_file_name)
            text_list = []
            regex = "(?<={{)[^}}]*(?=}})"
            text = docx2txt.process(request.data['word_template'])    
            used = set()
            text_list = [x for x in re.findall(regex, text) if x not in used and (used.add(x) or True)]
            print(text_list)
            test  = [{"placeholder_list" : text_list},{'filename' : new_file_name}]
            return JsonResponse(test,safe = False)
        
        except Exception as error:
            info_message = "Internal Server Error"
            print(info_message, error)
            return JsonResponse({'error': str(info_message) }, status=500)

class FillDocument(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = (IsAuthenticated,)
    renderer_classes = [TemplateHTMLRenderer]

    def post(self, request):
        try:
            templatejson = request.data['templatejson']
            file_name  =  request.data['fileName']
            if type(templatejson) != dict:
                templatejson=json.loads(templatejson)
            print(templatejson)
            details = WordTemplateData(details=templatejson).save()
            print(details)
            document = generateNew.from_template(file_name, templatejson)
            document.seek(0)
            file_name_split = file_name.split('/')[-1].split('.')[0]
            print(file_name_split)
            bytesio_object = document
            with open("{}.docx".format(file_name_split),'wb') as f:
                f.write(bytesio_object.getbuffer())
            output = subprocess.check_output(['libreoffice', '--convert-to', 'pdf' ,'{}.docx'.format(file_name_split)])
            print(type(output))
            filename = '{}.pdf'.format(file_name_split)
            wrapper = FileWrapper(open(filename,'rb'))
            response = HttpResponse(wrapper, content_type="application/pdf")
            response['Content-Disposition'] = "attachment; filename=" + filename

            return response
        
        except Exception as e:
            print("Exception in filling templates", e)
            info_message = "Internal Server Error"
            return JsonResponse({'error': str(info_message) }, status=500) 