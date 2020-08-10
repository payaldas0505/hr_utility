from django.http.response import HttpResponse, JsonResponse
from django.http import HttpResponseRedirect
from functools import partial, update_wrapper, wraps
from ..config import perms_config

def has_permission(perms): 
    """
    Decorder checks permission for requested url and method with session. 
    """
    def inner(func): 
        def wrap(self, request, *args, **kwargs):
            print("@"*20)
            pk = self.kwargs.get('pk')
            print('pk', pk )
            print("Check permission for: ", perms)

            # Exact url from the function
            raw_path = request.path
            path = raw_path.split("?")[0]
            if pk:
                path = path.rsplit("/", 1)[0]
            
            # Exact method from the function
            method = request.method.lower()
            print("Get requested url path: ", path)
            print("Get requested method: ", method)
            print("@"*20)
            try:
                session_perm_key = perms_config.session_perm_key
                print("session perm key", session_perm_key)

                if session_perm_key in request.session:

                    # Get permissions from the session 
                    session_perms_list = request.session[session_perm_key][perms]

                    #Compare the method and path
                    if session_perms_list['api_method'] == method and session_perms_list['url_identifier'] == path:
                        print('permissions in session', session_perms_list)
                        print("@"*20)
                        return func(self, request, *args, **kwargs)
                    
            except Exception as e:
                print(e)
                return HttpResponse(status=403) 
        return wrap   
    return inner  
  