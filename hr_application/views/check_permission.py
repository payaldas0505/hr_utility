from django.http.response import HttpResponse, JsonResponse
from django.http import HttpResponseRedirect
from functools import partial, update_wrapper, wraps



def has_permission(perms): 
    def inner(func): 
        def wrap(self, request, *args, **kwargs):
            print("@"*20)
            pk = self.kwargs.get('pk')
            print('args', pk )
            print("Check permission for: ", perms)
            raw_path = request.path
            path = raw_path.split("?")[0]
            if pk:
                path = path.rsplit("/", 1)[0]
            method = request.method
            print("Get requested url path: ", path)
            print("Get requested method: ", method)
            print("@"*20)
            try:
                session_perms_list = request.session[perms]
                if session_perms_list[1] == method and session_perms_list[2] == path:
                    print('permissions in session', session_perms_list)
                    print("@"*20)
                    return func(self, request, *args, **kwargs)
                    
            except Exception as e:
                print(e)
                err_msg = "You are not authorized to access this page"
                return HttpResponse(err_msg) 
        return wrap   
    return inner  
  