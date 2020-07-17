from django.contrib import admin
from .models import (UserRegisterationModel, UserRole, 
                    WordTemplateNew, Permission)
import nested_admin

# Register your models here.
admin.site.register(UserRegisterationModel)
# admin.site.register(UserRole)
admin.site.register(WordTemplateNew)

class PermissionInline(nested_admin.NestedTabularInline):
    extra = 0
    max_num = 1
    model = Permission

class UserRoleAdmin(nested_admin.NestedModelAdmin):  
    inlines = [PermissionInline]

admin.site.register(UserRole, UserRoleAdmin)