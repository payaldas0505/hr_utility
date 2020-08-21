from django.db import models
from django.contrib.auth.models import User
from model_utils import Choices
from django.db.models import Q
import jsonfield


class RolePermissions(models.Model):
    permission_name = models.CharField(max_length=100)
    api_method = models.CharField(max_length=100)
    url_identifier = models.CharField(max_length=100)
    status = models.BooleanField(null=False)
    class Meta:
        verbose_name_plural = "3.Permissions"
    def __str__(self):
        return 'Permission name: {}, API method: {}' .format(self.permission_name, self.api_method)


class UserRole(models.Model):
    role_name = models.CharField(max_length=100)
    role_status = models.BooleanField(null=False)
    permissions = models.ManyToManyField(RolePermissions)
    class Meta:
        verbose_name_plural = "2. Roles"
    def __str__(self):
        return '{}' .format(self.role_name)

# Create your models here.
class UserRegisterationModel(models.Model):
    user = models.OneToOneField(User, unique=True, on_delete=models.CASCADE, null=False)
    user_name = models.CharField(max_length=100, null=False)
    first_name = models.CharField(max_length=100, null=False)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, null=False)
    role = models.ManyToManyField(UserRole)
    user_status = models.BooleanField(null=False)
    class Meta:
        verbose_name_plural = "1. User Registration"
    def __str__(self):
        return '{}' .format(self.first_name)


# class UserRole(models.Model):
#     role_no = models.IntegerField(null=False)
#     role_name = models.CharField(max_length=100)
#     class Meta:
#         verbose_name_plural = "2. Roles and Permissions"
#     def __str__(self):
#         return '{}' .format(self.role_name)

# class Permission(models.Model):
#     permission = models.ForeignKey(UserRole, on_delete=models.CASCADE, null=False)
#     user_management_page = models.BooleanField(null=False)
#     add_user = models.BooleanField(null=False)
#     edit_user = models.BooleanField(null=False)
#     view_user = models.BooleanField(null=False)
#     delete_user = models.BooleanField(null=False)
#     template_management_page = models.BooleanField(null=False)
#     add_template = models.BooleanField(null=False)
#     edit_template = models.BooleanField(null=False)
#     view_template = models.BooleanField(null=False)
#     delete_template = models.BooleanField(null=False)

#     def __str__(self):
#         return '{}' .format(self.permission)

ORDER_COLUMN_CHOICES = Choices(
    ('0', 'user_name'),
    ('1', 'email'),
    ('2', 'user_status'),
    ('3', 'user_id')
)

def query_users_by_args(request,**kwargs):
    check_user_is_superuser = User.objects.filter(username = request.user.username).values('is_superuser')
    draw = int(kwargs.get('draw', None)[0])
    length = int(kwargs.get('length', None)[0])
    start = int(kwargs.get('start', None)[0])
    search_value = kwargs.get('search[value]', None)[0]
    order_column = kwargs.get('order[0][column]', None)[0]
    order = kwargs.get('order[0][dir]', None)[0]

    order_column = ORDER_COLUMN_CHOICES[order_column]
    if order == 'desc':
        order_column = '-' + order_column

    if check_user_is_superuser[0]['is_superuser'] == True:
        queryset = UserRegisterationModel.objects.all()
    else:
        getuserid = UserRegisterationModel.objects.filter(user_name = request.user.username).values('role')
        user_id = getuserid[0]['role']
        queryset = UserRegisterationModel.objects.filter(role__gte = user_id)

    total = queryset.count()

    if search_value:
        queryset = queryset.filter(Q(id__icontains=search_value) |
                                        Q(user_name__icontains=search_value) |
                                        Q(email__icontains=search_value)
                                        )


    count = queryset.count()

    queryset = queryset[start:start + length]

    return {
        'items': queryset,
        'count': count,
        'total': total,
        'draw': draw
    }

class WordTemplateNew(models.Model):
    word_name = models.CharField(max_length=100, null=False)
    word_template = models.FileField(upload_to = 'word_template', blank = False)
    class Meta:
        verbose_name_plural = "4. Uploaded Templates"
    def __str__(self):
        return '{}' .format(self.word_name)

class WordTemplateData(models.Model):
    pdf_name =  models.CharField(max_length=100)
    dummy_values = jsonfield.JSONField()
    pdf = models.FileField(upload_to = 'filled_template', blank = False)
    class Meta:
        verbose_name_plural = "5. Templates Details"
    def __str__(self):
        return '{}' .format(self.pdf_name)

class FilledTemplateData(models.Model):
    fill_values = jsonfield.JSONField()
    template_name = models.CharField(max_length=100, null=False)
    employee_name = models.CharField(max_length=100, null=False)
    docx_name = models.CharField(max_length=100, null=False)

    class Meta:
        verbose_name_plural = "6. Fill Template Details"
    def __str__(self):
        return '{}'.format(self.fill_values)

    ORDER_COLUMN_CHOICES = Choices(
        ('0', 'pdf_name'),
        ('1', 'dummy_values'),
        ('2', 'id'),
        ('3', 'pdf')
    )


def query_templates_by_args(request,**kwargs):
    check_user_is_superuser = User.objects.filter(username = request.user.username).values('is_superuser')
    draw = int(kwargs.get('draw', None)[0])
    length = int(kwargs.get('length', None)[0])
    start = int(kwargs.get('start', None)[0])
    search_value = kwargs.get('search[value]', None)[0]
    order_column = kwargs.get('order[0][column]', None)[0]
    order = kwargs.get('order[0][dir]', None)[0]

    order_column = ORDER_COLUMN_CHOICES[order_column]
    if order == 'desc':
        order_column = '-' + order_column


    queryset = WordTemplateData.objects.all()
    total = queryset.count()

    if search_value:
        queryset = queryset.filter(Q(id__icontains=search_value) |
                                        Q(pdf_name__icontains=search_value)
                                        )


    count = queryset.count()

    queryset = queryset[start:start + length]

    return {
        'items': queryset,
        'count': count,
        'total': total,
        'draw': draw
    }


ORDER_COLUMN_CHOICES_FILL = Choices(
        ('0', 'employee_name'),
        ('1', 'template_name'),
        ('2', 'docx_name'),
        ('3', 'id')
    )

def query_fill_templates_by_args(request,**kwargs):
    check_user_is_superuser = User.objects.filter(username = request.user.username).values('is_superuser')
    draw = int(kwargs.get('draw', None)[0])
    length = int(kwargs.get('length', None)[0])
    start = int(kwargs.get('start', None)[0])
    search_value = kwargs.get('search[value]', None)[0]
    order_column = kwargs.get('order[0][column]', None)[0]
    order = kwargs.get('order[0][dir]', None)[0]

    order_column = ORDER_COLUMN_CHOICES_FILL[order_column]
    if order == 'desc':
        order_column = '-' + order_column


    queryset = FilledTemplateData.objects.all()
    total = queryset.count()

    if search_value:
        queryset = queryset.filter(Q(id__icontains=search_value) |
                                        Q(employee_name__icontains=search_value) |
                                        Q(template_name__icontains=search_value)
                                        )


    count = queryset.count()

    queryset = queryset[start:start + length]

    return {
        'items': queryset,
        'count': count,
        'total': total,
        'draw': draw
    }
