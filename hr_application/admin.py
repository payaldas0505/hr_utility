from django.contrib import admin
from .models import (UserRegisterationModel, UserRole,
                     WordTemplateNew, RolePermissions,
                     WordTemplateData, PageLabel, PageName, Language)
import nested_admin

# Register your models here.
admin.site.register(UserRegisterationModel)
# admin.site.register(UserRole)
admin.site.register(RolePermissions)
admin.site.register(WordTemplateData)
admin.site.register(WordTemplateNew)


class UserRoleAdmin(admin.ModelAdmin):
    filter_horizontal = ('permissions',)


admin.site.register(UserRole, UserRoleAdmin)


class PageLabelInline(nested_admin.NestedTabularInline):
    extra = 0
    model = PageLabel


class PageNameInline(nested_admin.NestedTabularInline):
    extra = 0
    fk_name = 'language_name'
    model = PageName
    inlines = [PageLabelInline]


class LanguageAdmin(nested_admin.NestedModelAdmin):
    inlines = [PageNameInline]


admin.site.register(Language, LanguageAdmin)
