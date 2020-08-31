from django.http.response import HttpResponse, JsonResponse
from django.http import HttpResponseRedirect
from functools import partial, update_wrapper, wraps
from ..config import perms_config
import re
from django.core.cache import cache

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

            print("@"*20+"  START PATH  "+"@"*20)
            pk = view_kwargs.get('pk')

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
                if check_url_pass(path, view_function):
                    return func(self, request, view_function, view_args, view_kwargs)

                # Get the Global Permission key
                session_perm_key = perms_config.session_perm_key
                print("session perm key", session_perm_key)

                # Check if permission key is in session
                if session_perm_key in request.session:

                    # Get permissions list value from the session
                    session_perms_list = request.session[session_perm_key]
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
                    del request.session[session_perm_key]
                    request.session.flush()
                    request.session.clear()
                    # Clear cache
                    cache.clear()
                    print("403 for loop")
                    return HttpResponse(status=403)
                else:
                    del request.session[session_perm_key]
                    request.session.flush()
                    request.session.clear()
                    # Clear cache
                    cache.clear()
                    print("403 if permission key not in session ")
                    return HttpResponse(status=403)

            except Exception as e:
                print(e)
                request.session.flush()
                return HttpResponse(status=403)
        return wrap
    return inner
