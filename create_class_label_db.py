from hr_application.models import Language, PageName, PageLabel, UserRole, RolePermissions
import os
import json
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hr_utility.settings')

application = get_wsgi_application()
create_langauge_query = PageLabel.objects.all().values('page_label_class_name',
                                                       'page_label_text', 'page_name__page_name', 'page_name__language_name__language_name')
print(create_langauge_query)



with open ('create_langauge_json.json', 'w') as f:
     json.dump(create_language_dict, f)


create_role_permission_query = UserRole.objects.all().values('role_name','role_status','permissions__permission_name','permissions__api_method','permissions__url_identifier','permissions__status')