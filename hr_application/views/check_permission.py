from django.http.response import HttpResponse, JsonResponse
from django.http import HttpResponseRedirect
from functools import partial, update_wrapper, wraps

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
            method = request.method
            print("Get requested url path: ", path)
            print("Get requested method: ", method)
            print("@"*20)
            try:
                # Get permissions from the session 
                session_perms_list = request.session[perms]

                #Compare the permission url and method
                if session_perms_list[1] == method and session_perms_list[2] == path:
                    print('permissions in session', session_perms_list)
                    print("@"*20)
                    return func(self, request, *args, **kwargs)
                    
            except Exception as e:
                print(e)
                err_msg = "<h1 style='color: red; text-align:center;'>\
                    You are not authorized to access this page...!!!<h1>"
                print(err_msg)
                return HttpResponse(err_msg) 
        return wrap   
    return inner  
  