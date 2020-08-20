from rest_framework import serializers
from .models import UserRegisterationModel, WordTemplateNew, WordTemplateData, FilledTemplateData
from django.contrib.auth.models import User

class AuthUserSerializer(serializers.ModelSerializer):
    class Meta :
        model = User
        fields = (
            'username',
            'email',)

class UserRegisterationModelSerializer(serializers.ModelSerializer):
    class Meta :
        model = UserRegisterationModel
        exclude = (
        'user',)


class DatatableSerializer(serializers.ModelSerializer):
    class Meta :
        model = UserRegisterationModel
        fields = (
            'user_name',
            'email',
            'user_status',
            'user_id'
        )


class WordTemplateUploadSerializer(serializers.ModelSerializer):
    class Meta :
        model = WordTemplateNew
        fields = (
                    'word_template',
                    'word_name'
                )

class WordTemplateDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordTemplateData
        fields = (
                    'id',
                    'pdf_name',
                    'dummy_values',
                    'pdf'
                )

class FilledTemplateDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilledTemplateData
        fields = (
            '__all__'
        )