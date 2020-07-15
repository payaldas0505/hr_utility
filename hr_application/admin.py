from django.contrib import admin
from .models import (UserRegisterationModel, UserRole, 
                    WordTemplateNew, LevelModel)
import nested_admin

# Register your models here.
admin.site.register(UserRegisterationModel)
# admin.site.register(UserRole)
admin.site.register(WordTemplateNew)

class LevelModelInline(nested_admin.NestedTabularInline):
    extra = 0
    max_num = 1
    model = LevelModel

class UserRoleAdmin(nested_admin.NestedModelAdmin):  
    inlines = [LevelModelInline]

admin.site.register(UserRole, UserRoleAdmin)