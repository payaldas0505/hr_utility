from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class UserRegisterationModel(models.Model):
    user = models.OneToOneField(User, unique=True, on_delete=models.CASCADE, null=False)
    user_name = models.CharField(max_length=100, null=False)
    first_name = models.CharField(max_length=100, null=False)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, null=False)
    role = models.IntegerField(null=False, default=2)
    class Meta:
        verbose_name_plural = "1. User Registration"
    def __str__(self):
        return '{}' .format(self.first_name)


class UserRole(models.Model):
    role_no = models.IntegerField(null=False)
    role_name = models.CharField(max_length=100)
    class Meta:
        verbose_name_plural = "2. Role Permissions"
    def __str__(self):
        return '{}' .format(self.role_name) 