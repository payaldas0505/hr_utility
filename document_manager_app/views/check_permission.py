from django.http.response import HttpResponse, JsonResponse
from django.http import HttpResponseRedirect
from functools import partial, update_wrapper, wraps
from ..config import perms_config
import re
from django.core.cache import cache
# from ..views.user_authentication_view import LogoutView
from ..models import RolePermissions
from rest_framework.decorators import permission_classes, authentication_classes
# from .user_authentication_view import CustomJWTAuthentication, IsAuthenticated
from rest_framework_simplejwt import authentication
from ..models import UserRegisterationModel

def format_path(raw_path, pk):
    """Format all kind of urls and send the finale path"""

    print('pk', pk)
    media_pdf = ['media', '.pdf', '.docx', '.mp4']
    path = raw_path.split("?")[0]
    if pk or any(x in path for x in media_pdf):
        path = path.rsplit("/", 1)[0]
        print('path', path)

        return path

    return path


def check_url_pass(path, view_function):
    """Check for urls pass without check for permissions"""

    if path in perms_config.pass_urls or 'django.contrib.admin' in view_function.__module__ or re.search(r"^/static/.*\.(css|js|svg|jpeg|jpg|png|woff)$", path) or re.search(r"^/reset/.*", path):
        print("^"*20)
        print("passing the url without permission check", path)
        print("^"*20)
        return True
    return None


def has_permission():
    """
    Decorder checks permission for requested url and method with session.
    """
    def inner(func):
        def wrap(self, request, view_function, view_args, view_kwargs):
            # request.user = authentication.JWTAuthentication().authenticate(request)[0]  # Manually authenticate the token
            print(request.user)
            print("@"*20+"  START PATH  "+"@"*20)
            pk = view_kwargs.get('pk')
            print("request.user", request.user)
            # Exact url from the function
            raw_path = request.path
            path = format_path(raw_path, pk)

            # Exact method from the function
            method = request.method.lower()
            print("Get requested url path: ", path)
            print("Get requested method: ", method)
            print("@"*20+"  END PATH  "+"@"*20)

            try:
                # Check for passing urls without any check for permissions and return function
                check_for_ur_pass = check_url_pass(path, view_function)
                if check_for_ur_pass:
                    return func(self, request, view_function, view_args, view_kwargs)

                # Get the Global Permission key
                get_session_perm_key = perms_config.session_perm_key
                print("session perm key", get_session_perm_key)
                i = 0
                while True:
                    i += 1
                    if perms_config.session_perm_key in request.session:

                        print(request.session[perms_config.session_perm_key])

                        print("----break----"*20)
                        break
                    if i == 10:
                        break

                    print(i, "continue")
                    continue
                # Check if permission key is in session
                if get_session_perm_key in request.session:

                    # Get permissions list value from the session
                    session_perms_list = request.session[get_session_perm_key]
                    print('session_perms_list', session_perms_list)

                    # Looping through the list of session perms
                    for session_perms in session_perms_list:

                        # Compare the method and path
                        if session_perms['api_method'] == method and session_perms['url_identifier'] == path:
                            print('+'*20)
                            print('API method: {}, Url_identifier: {}'.format(
                                session_perms['api_method'], session_perms['url_identifier']))
                            print('+'*20)
                            print("#"*20)
                            return func(self, request, view_function, view_args, view_kwargs)

                    print("403 for loop")
                    return HttpResponse(status=403)
                else:

                    print("403 if permission key not in session ")
                    return HttpResponse(status=403)

            except Exception as e:
                print(e)
                # request.session.flush()
                return HttpResponse(status=403)
        return wrap
    return inner


def get_permission(request):
    try:
        print("-"*20)
        user_id = request.user.id
        print('user_id', user_id)
        print("-"*20)
        perms = UserRegisterationModel.objects.filter(
            id=user_id
        ).filter(
            role__role_status=True
        ).filter(
            role__permissions__status=True
        ).values(
            'role__permissions__permission_name',
            'role__permissions__api_method',
            'role__permissions__url_identifier')

        # Permissions setting in session
        perms_list_font_end = []
        permission_list_backend = []

        for perm in perms:
            permission_dict = {}
            for key, value in perm.items():
                if key == 'role__permissions__permission_name':
                    permission_dict['permission_name'] = value.lower()

                elif key == 'role__permissions__api_method':
                    permission_dict['api_method'] = value.lower()

                else:
                    permission_dict['url_identifier'] = value

            perm_name_method = perm['role__permissions__permission_name'].lower(
            ) + '_'+perm['role__permissions__api_method'].lower()
            perms_list_font_end.append(perm_name_method)

            permission_list_backend.append(permission_dict)

        request.session[perms_config.session_perm_key] = permission_list_backend
        request.session.modified = True
    except Exception as e:
        print("exception in fetching permission", e)
        return HttpResponse(403)


def check_url_pass_view(path):
    if path in perms_config.pass_urls:
        return True
    else:
        return False



def check_role_permission():
    """
    Decorder checks permission for requested url and method with session.
    """
    def inner(func):
        def wrap(self, request, *awargs, **kwargs):

            pk = kwargs.get('pk')

            # Exact url from the function
            raw_path = request.path
            path = format_path(raw_path, pk)

            # Exact method from the function
            method = request.method.lower()

            try:
                # pass
                check_url_pass = check_url_pass_view(path)
                if check_url_pass:
                    return func(self, request, *awargs, **kwargs)
                
                 # Get the Global Permission key
                get_session_perm_key = perms_config.session_perm_key

                if perms_config.session_perm_key in request.session:

                    print(request.session[perms_config.session_perm_key])
                else:
                    get_permission(request)

                # if get_session_perm_key in request.session:

                # Get permissions list value from the session
                session_perms_list = request.session[get_session_perm_key]

                # Looping through the list of session perms
                for session_perms in session_perms_list:

                    # Compare the method and path
                    if session_perms['api_method'] == method and session_perms['url_identifier'] == path:
                        return func(self, request, *awargs, **kwargs)

                print("403 for loop")
                return HttpResponse(status=403)
                # else:

                #     print("403 if permission key not in session ")
                #     return HttpResponse(status=403)

            except Exception as e:
                print(e)
                # request.session.flush()
                return HttpResponse(status=403)
        return wrap
    return inner
