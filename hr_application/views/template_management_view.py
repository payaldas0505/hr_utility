from .user_authentication_view import CustomJWTAuthentication, IsAuthenticated, TemplateHTMLRenderer
from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response

from django.http.response import HttpResponse, JsonResponse

from django.contrib.auth.models import User

from django.db import transaction

from ..import generate, generateNew
from .check_permission import check_permission
from django.core.files.storage import FileSystemStorage
import json
from ..serializer import WordTemplateNewSerializer
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

    def get(self, request):
        """Renders Registration form."""  
        try:
            permission_for = "add_template"
            user_id = request.user.id
            permission = check_permission(permission_for, user_id)
            if permission == "granted":
                return render(request, 'template_management/add_template.html')
            return permission                                     

            
        
        except Exception as e:
            print("Error in getting registeration page:", e)
            info_message = 'Cannot get the registeration page.'
            print(info_message)
            return  JsonResponse({"error": str(info_message)}, status=5)
    
    def post(self,request):

        try:
            permission_for = "add_template"
            user_id = request.user.id
            permission = check_permission(permission_for, user_id)
            if permission == "granted":
                pass
            else:
                return permission

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

