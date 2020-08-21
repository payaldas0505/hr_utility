
$(document).ready(function () {
    $(".add_user").hide();
    getUserRoleDropDown();
    SetPermissionsUserDashboard();
})

var userDetails = getValues('UserDetails')
var access = userDetails.access

function getUserRoleDropDown() {

    //Get the role dropdown
    $.ajax({
        url: 'add_user/get_roles/',
        headers: { Authorization: 'Bearer ' + access },
        type: 'GET',

        success: function (response) {
            console.log(response)

            var next_id = $("#role_drop_down");
            $.each(response, function (key, value) {
                role = '<span class="role_option_' + value.id + '">' + value.role_name + '</span>'
                $(next_id).append($("<option></option>").attr("value", value.id).html(role));
            });
            $(next_id).not('.disabled').formSelect();
        },
        error: function (data) {
            if (data.status == 401) {
                getaccessToken(getUserRoleDropDown);
            }
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.error, classes: 'red rounded' })
        }

    });
}

// Get Main dashboard
function getdashboard() {
    var token = access;
    var get_url = "/dashboard/"
    $.ajax({
        method: 'GET',
        url: get_url,
        success: function (data) {
            window.location.href = get_url
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                getaccessTokenForUrl(get_url)
            }
        }
    })
}

//  Get Add new user page
function GetAddUserPage() {

    var token = access;
    var get_url = '/dashboard/user_management/add_user/'
    $.ajax({
        type: 'GET',
        url: '/dashboard/user_management/add_user/',
        headers: { Authorization: 'Bearer ' + access },
        success: function (data) {
            window.location.href = get_url
        },
        error: function (data) {
            if (data.status == 401) {
                getaccessTokenForUrl(get_url);
            }
            if (data.status == 403) {
                logout();
            }
        }
    })
}


// get user management dashboard
function getUserDashboardDatatable() {
    var token = access;
    var get_url = "/dashboard/user_management/"
    $.ajax({
        method: 'GET',
        url: get_url,
        success: function (data) {
            window.location.href = get_url
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                getaccessTokenForUrl(get_url);
            }
            if (xhr.status == 403) {
                logout();
            }
        }
    })
}

// Delete user by id
function DeleteReport(id) {
    url = 'edit_user_form/' + id
    var userDetails = getValues('UserDetails')
    var token = userDetails.access
    $.ajax({
        url: url,
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
        dataType: 'text',
        async: false,
        success: function (jsonData) {
            parsed_jsondata = JSON.parse(jsonData)
            M.toast({ html: parsed_jsondata.message, classes: 'green rounded' })
            setTimeout(function () {

                window.location.href = "/dashboard/user_management/"
            }, 2000);
        },
        error: function (xhr, status, error) {
            console.log(xhr)
            console.log(status)
            console.log(error)
            console.log(xhr.status)
            if (xhr.status == 401) {

                getaccessTokenUserDashboard(DeleteReport);
            }
            if (xhr.status == 403) {
                logout();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }

    })

}

// delete confirm prompt
function getDeleteReport(id) {
    var confirmation = confirm("Are you sure?\nDo you want to delete this user?");
    if (confirmation == true) {
        DeleteReport(id)
    }
    else {
        return false
    }

}

//Get Datatable for user management
function getDashboardDatatable() {
    var token = access;
    var get_url = "/dashboard/"
    $.ajax({
        method: 'GET',
        url: get_url + token,
        success: function (data) {
            window.location.href = get_url
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                getaccessTokenForUrl(get_url);
            }
        }
    })
}

//View of the user by ID
function getViewReport(id) {
    url = 'edit_user_form/' + id
    window.localStorage.setItem('editedUserId', id)
    var userDetails = getValues('UserDetails')
    var token = userDetails.access
    $.ajax({
        url: url,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
        dataType: 'text',
        async: false,
        success: function (jsonData) {
            console.log(jsonData)
            parsed_json = JSON.parse(jsonData)
            data = parsed_json.message
            console.log(data)
            for (i = 0; i < data.length; i++) {
                user_name = data[i].user_name
                first_name = data[i].first_name
                last_name = data[i].last_name
                email = data[i].email
                user_status_edit = data[i].user_status
                role = data[i].role__id
            }
            $('#submit_edit_form').hide();
            $("#DisableDiv").find("*").prop('disabled', true);
            $('#SubmitEditUser').hide();
            $('#Dashboard_main').hide();
            $('#dashboardRegisterForm').show();

            $('#user_name_edit').val(user_name);
            $('#first_name_edit').val(first_name);
            $('#last_name_edit').val(last_name);
            $('#email_edit').val(email);
            $('#user_status_edit').prop('checked', user_status_edit);

            $('#role_drop_down').prop("disabled", true);
            $('#role_drop_down').find('option[value=' + role + ']').prop('selected', true);
            $('select').formSelect();
        },
        error: function (xhr, status, error) {
            if (xhr.status == 401) {

                getaccessTokenUserDashboard(getViewReport);
            }
            if (xhr.status == 403) {
                logout();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }
    })

}

// Edit of the user by ID
function getEditReport(id) {
    var userDetails = getValues('UserDetails')
    var token = userDetails.access
    url = 'edit_user_form/' + id
    window.localStorage.setItem('editedUserId', id)
    $.ajax({
        url: url,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
        dataType: 'text',
        async: false,
        success: function (jsonData) {
            console.log(jsonData)
            parsed_json = JSON.parse(jsonData)
            data = parsed_json.message
            console.log(data)
            for (i = 0; i < data.length; i++) {
                user_name = data[i].user_name
                first_name = data[i].first_name
                last_name = data[i].last_name
                email = data[i].email
                user_status_edit = data[i].user_status
                role = data[i].role__id
            }

            $('#Dashboard_main').hide();
            $('#dashboardRegisterForm').show();
            $('#user_name_edit').val(user_name)
            $('#first_name_edit').val(first_name)
            $('#last_name_edit').val(last_name)
            $('#email_edit').val(email)
            $('#user_status_edit').val(user_status_edit)
            $('#user_status_edit').prop('checked', user_status_edit);
            $('#role_drop_down').find('option[value=' + role + ']').prop('selected', true);
            $('#role_drop_down').formSelect();
        },
        error: function (xhr, status, error) {
            console.log(xhr)
            console.log(status)
            console.log(error)
            console.log(xhr.status)
            if (xhr.status == 401) {

                getaccessTokenUserDashboard(getEditReport);
            }
            if (xhr.status == 403) {
                logout();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }
    })

}

// Save the edited user
function EditUserSave(user_name, first_name,
    last_name, email,
    user_status, role) {
    var edituserid = window.localStorage.getItem('editedUserId')
    role = $("#role_drop_down option:selected").val();
    var formData = new FormData();

    formData.append('user_name', user_name);
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('email', email);
    formData.append('user_status', user_status);
    formData.append('role', role);

    url = 'edit_user_form/' + edituserid
    $.ajax({
        url: url,
        method: "PUT",
        headers: { Authorization: 'Bearer ' + access },
        enctype: 'multipart/form-data',
        data: formData,
        contentType: false,
        processData: false,
        async: false,
        success: function (jsonData) {
            M.toast({ html: jsonData.message, classes: 'green rounded' })

            setTimeout(function () {
                window.location.reload();
            }, 3000);
        },
        error: function (xhr, status, error) {
            if (xhr.status == 401) {

                getaccessToken(EditUserSave);
            }
            if (xhr.status == 403) {
                logout();
            }

            $("#submit_edit_form").attr("disabled", false);
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }
    })
}

// Validation of user edit
function EditUserValidation() {
    $("#submit_edit_form").attr("disabled", true);

    user_name = $('#user_name_edit').val()
    first_name = $('#first_name_edit').val();
    last_name = $('#last_name_edit').val();
    email = $('#email_edit').val();
    user_status = $("input[name='user_status_edit']:checked", '#registration_form').val();
    role = $("#role_drop_down option:selected").val();

    if (user_status) {
        user_status = true
    }
    else {
        user_status = false
    }
    $('input:radio[name=sex]:nth(1)').attr('checked', true);

    if (user_name == "") {
        $("#submit_edit_form").attr("disabled", false);
        M.toast({ html: 'Username must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (first_name == "") {
        $("#submit_edit_form").attr("disabled", false);
        M.toast({ html: 'First name must be filled out!', classes: 'red rounded' })
        return false;
    }

    else if (last_name == "") {
        $("#submit_edit_form").attr("disabled", false);
        M.toast({ html: 'Last name must be filled out!', classes: 'red rounded' })
        return false;
    }

    else if (email == "") {
        $("#submit_edit_form").attr("disabled", false);
        M.toast({ html: 'Email address must be filled out!', classes: 'red rounded' })
        return false;
    }

    else if (role == "") {
        $("#submit_edit_form").attr("disabled", false);
        M.toast({ html: 'Please assign an to the user!', classes: 'red rounded' })
        return false;
    }
    else {
        EditUserSave(user_name, first_name,
            last_name, email,
            user_status, role)
    }
}

// Get the permissions from LocalStorge
function SetPermissionsUserDashboard() {
    var userPermissions = getValues('UserPermissions')

    if (!jQuery.isEmptyObject(userPermissions)) {
        if (userPermissions.includes('add_user_get')) {
            $(".add_user").show();
        }

    }
}
