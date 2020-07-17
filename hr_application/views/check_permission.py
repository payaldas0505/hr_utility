from django.http.response import HttpResponse, JsonResponse
from django.http import HttpResponseRedirect
from functools import partial, update_wrapper, wraps



def has_permission(perms): 
    def inner(func): 
        def wrap(self, request, *args, **kwargs):
            print("@"*20)
            print("inside decorder permission for {} = {}".format(perms, request.session[perms]))
            print("@"*20)
            if request.session[perms]:
                return func(self, request, *args, **kwargs)
            else:
                return HttpResponse("You are not authorized to access this page") 
        return wrap   
    return inner  
  