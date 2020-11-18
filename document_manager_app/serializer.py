from rest_framework import serializers
from .models import UserRegisterationModel, WordTemplateNew, WordTemplateData, FilledTemplateData
from django.contrib.auth.models import User


class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'username',
            'email',)


class UserRegisterationModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRegisterationModel
        exclude = (
            'user',
            'delete_status')


class DatatableSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRegisterationModel
        fields = (
            'user_name',
            'email',
            'user_status',
            'user_id'
        )


class WordTemplateUploadSerializer(serializers.ModelSerializer):
    class Meta:
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
            'pdf',
            'word_template'
        )


class FilledTemplateDataSerializer(serializers.ModelSerializer):

    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()

    class Meta:
        model = FilledTemplateData
        fields = (
            'id',
            'fill_values',
            'template_name',
            'employee_name',
            'docx_name',
            'created_by',
            'created_at',
            'updated_at'
        )

    def get_created_at(self, obj):
        return obj.created_at.date()
    
    def get_updated_at(self, obj):
        return obj.updated_at.date()
