from ..models import UserRegisterationModel, LevelModel
from django.http.response import HttpResponse, JsonResponse
from django.contrib.auth.models import User

def check_permission(permission_for, user_id):
    """Check User is having permission or not."""

    if User.objects.filter(id=user_id).filter(is_superuser=False):
        role_of_user = UserRegisterationModel.objects.filter(user_id = user_id).values('role')
        has_permission = LevelModel.objects.filter(level_id = role_of_user[0]['role']).values(permission_for)
       
        if(has_permission[0][permission_for] == True):
            info_message = 'granted'
            print("grant permission", info_message)
            return info_message
        
        else:
            info_message = "no permission for {}".format(permission_for)
            print("no permission granted", info_message)
            return JsonResponse({'message' : info_message})
    
    info_message = 'granted'
    print("grant permission to superuser", info_message)
    return info_message