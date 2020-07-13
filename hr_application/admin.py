from django.contrib import admin
from .models import (UserRegisterationModel, UserRole,
                    )
# Register your models here.
admin.site.register(UserRegisterationModel)
admin.site.register(UserRole)
