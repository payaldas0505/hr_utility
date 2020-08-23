
from rest_framework.views import APIView
from django.http.response import HttpResponse, JsonResponse
from ..models import (Language, PageName, PageLabel)
from rest_framework.permissions import IsAuthenticated, AllowAny


class GetLabels(APIView):
    """Gets labels from the database."""
    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            jsondata = request.data
            print(jsondata)
            page_name = jsondata['page_name']
            language_id = jsondata['language_id']

            if jsondata['language_id'] == None:
                language_id = 1

            get_language_name = Language.objects.filter(
                id=language_id).values('id')

            language_name_id = get_language_name[0]['id']

            # if request.session['language'] == language_name_id:
            #     pass

            # else:
            #     request.session['language'] = language_name_id

            print('language_name_id', language_name_id)

            get_page_name_id = PageName.objects.filter(
                language_name_id=language_name_id).filter(page_name=page_name).values('id')

            page_name_id = get_page_name_id[0]['id']
            print(page_name_id)

            page_labels = list(PageLabel.objects.filter(page_name_id=page_name_id).values(
                'page_label_class_name', 'page_label_text'))

            print(page_labels)
            return JsonResponse(page_labels, safe=False)

        except Exception as e:
            info_message = "Cannot fetch labels from database"
            print(info_message)
            print("exception in getting label", e)
            return JsonResponse({"success": False, "error": str(info_message)}, status=404)


class GetLangauges(APIView):
    """Gets labels from the database."""
    def get(self, request):
        # get_language = set_session_language(request)
        try:
            get_languages = Language.objects.all().values('id','language_name')
            print('lan', get_languages[0])
            # request.session['language'] = get_languages[0]['id']

            # print("set language ", request.session['language'] )
            language_list = []
            for language in get_languages:
                language_list.append(language)
            print(language_list)
            return JsonResponse(language_list, safe=False)
        except Exception as e:
            info_message = '"Cannot fetch languages from database"'
            print(info_message)
            print("exception in getting label", e)
            return JsonResponse({"success": False, "error": str(info_message)}, status=404)