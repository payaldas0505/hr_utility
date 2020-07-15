from rest_framework import serializers 
from .models import UserRegisterationModel, WordTemplateNew
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


class WordTemplateNewSerializer(serializers.ModelSerializer):
    class Meta : 
        model = WordTemplateNew
        fields = '__all__'