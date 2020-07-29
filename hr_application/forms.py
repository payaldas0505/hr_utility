from django.forms import ModelForm 
from django import forms 
from .models import UserRegisterationModel
from django.contrib.auth.models import User

class UserRegisterationForm(ModelForm): 
    """Check the validation of the  registraion form."""
    class Meta: 
        model = UserRegisterationModel         
        exclude = ['user', 'role'] 
  

class UserForm(ModelForm): 
    """Check the validation of User form."""
    class Meta: 
        model = User         
        fields = ['username','email','password'] 
  