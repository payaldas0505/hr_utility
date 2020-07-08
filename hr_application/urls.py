from django.urls import path, include
from .views import (LoginView, CustomTokenObtainPairView,
                    CustomTokenRefreshView, Dashboard,
                    NewPasswordView)

urlpatterns = [
    path('api/rest-auth/', include('rest_auth.urls')),
    path('login/', LoginView.as_view(), name="login"),
    path('access_token/', CustomTokenObtainPairView.as_view(), name="gettoken"),
    path('refresh_token/', CustomTokenRefreshView.as_view()),
    path('dashboard/', Dashboard.as_view(), name="dashboard"),
    path('forgot_password/', NewPasswordView.as_view(), name="forgot_password"),
]