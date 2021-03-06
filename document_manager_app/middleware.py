from django.http.response import HttpResponse
from .views.check_permission import has_permission, check_role_permission


class RoleBasedPermissionMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response


    # def process_view(self, request, view_function, view_args, view_kwargs):
    #     print(view_function)
        
    #     return None
    
