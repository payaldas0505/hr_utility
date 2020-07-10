from django.urls import path, include
from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from django.contrib.auth import views as auth_views

from .views import (LoginView, CustomTokenObtainPairView,
                    CustomTokenRefreshView, Dashboard,
                    NewPasswordView, ChangePasswordView,
                    LogoutView)

urlpatterns = [
    path('api/rest-auth/', include('rest_auth.urls')),
    path('login/', LoginView.as_view(), name="login"),
    path('logout/', LogoutView.as_view(), name = "logout"),
    path('access_token/', CustomTokenObtainPairView.as_view(), name="gettoken"),
    path('refresh_token/', CustomTokenRefreshView.as_view()),
    path('dashboard/', Dashboard.as_view(), name="dashboard"),
    path('forgot_password/', NewPasswordView.as_view(), name="forgot_password"),
    url(r'^dashboard/change_password/$', 
        ChangePasswordView.as_view(), 
        name='password_change'),
    # url(r'^dashboard/password/change/done/$',
    #     CustomPasswordChangeView.as_view(), 
    #     name='password_change_done'),
    # path('dashboard/password/', login_required(ChangePassword.as_view()), name='change_password'),
]