from django.urls import path, include
from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from django.contrib.auth import views as auth_views

from .views import (LoginView, CustomTokenObtainPairView,
                    CustomTokenRefreshView, Dashboard,
                    NewPasswordView, LogoutView,
                    GetChangePasswordView, SaveChangePasswordView,
                    UserManagementDashboard, TemplateManagementDashboard,
                    AddUserFormView, GetRoleDropDown,
                    CheckUsername, CheckEmail,
                    GetAllUsersView, UserDatatableView,
                    NewGenDocxView, GetPermissions,
                    FillDocument, GetAllTemplatesView,
                    WordTemplateDataView, DocumentTeamplateDropdown, SelectTemplate, FillDropdownTemplate, GetAllFillTemplate)

urlpatterns = [
    path('api/rest-auth/', include('rest_auth.urls')),

    path('login/', LoginView.as_view(), name="login"),

    path('logout/', LogoutView.as_view(), name = "logout"),

    path('access_token/', CustomTokenObtainPairView.as_view(), name="gettoken"),

    path('refresh_token/', CustomTokenRefreshView.as_view()),

    path('dashboard/', Dashboard.as_view(), name="dashboard"),

    path('dashboard/permission', GetPermissions.as_view(), name='permission'),

    path('forgot_password/', NewPasswordView.as_view(), name="forgot_password"),

    path('dashboard/get_change_password/', GetChangePasswordView.as_view(),
        name='get_change_password'),

    path('dashboard/save_password/', SaveChangePasswordView.as_view(),
        name='save_password'),

    path('dashboard/user_management/', UserManagementDashboard.as_view(), name="user_management"),

    path('dashboard/user_management/add_user/', AddUserFormView.as_view(), name="add_user"),

    path('dashboard/user_management/get_all_user', GetAllUsersView.as_view(), name="get_all_user"),

    path('dashboard/user_management/add_user/get_roles/', GetRoleDropDown.as_view(), name="get_roles"),

    path('dashboard/user_management/add_user/check_username/', CheckUsername.as_view(), name="check_username"),

    path('dashboard/user_management/add_user/check_email/', CheckEmail.as_view(), name="check_email"),

    path('dashboard/user_management/edit_user_form/<int:pk>', UserDatatableView.as_view(), name="edit_user_form"),

    path('dashboard/template_management/', TemplateManagementDashboard.as_view(), name="template_management"),

    path('dashboard/template_management/add_template/', NewGenDocxView.as_view(), name='new_generate_docx'),

    path('dashboard/template_management/get_all_templates', GetAllTemplatesView.as_view(), name="get_all_templates"),

    path('dashboard/template_management/add_template/fill/', FillDocument.as_view(), name='fill_docx'),

    path('dashboard/template_management/delete_template/<int:pk>', WordTemplateDataView.as_view(), name='delete_template'),

    path('dashboard/document_template_dropdown/', DocumentTeamplateDropdown.as_view(), name='document_template_dropdown'),

    path('dashboard/select_template/<int:pk>', SelectTemplate.as_view(), name = 'select_template'),

    path('dashboard/fill_dropdown_template/', FillDropdownTemplate.as_view(), name= 'fill_dropdown_template'),

    path('getallfilltemplate', GetAllFillTemplate.as_view(), name = 'get_all_fill_template')
]
