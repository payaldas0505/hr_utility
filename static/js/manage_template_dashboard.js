$(document).ready(function() {
    $(".add_template").hide();
    SetPermissionsTemplateDashboard();
})

// Get the permissions from LocalStorge
function SetPermissionsTemplateDashboard() {
    var userPermissions = getValues('UserPermissions')

    if (!jQuery.isEmptyObject(userPermissions)) {
        if (userPermissions.includes('add_template_get')) {
            $(".add_template").show();
        }

    }
}

var userDetails = getValues('UserDetails')
var access = userDetails.access

function getdashboard() {
    var token = access;
    var get_url = "/dashboard/?token="
    $.ajax({
        method: 'GET',
        url: get_url + token,
        success: function(data) {
            window.location.href = get_url + token
        },
        error: function(xhr) {
            if (xhr.status == 401) {
                getaccessTokenForUrl(get_url);
            }
        }
    })
}




function GetAddTemplatePage() {

    var token = access;
    var get_url = 'add_template/?token='
    $.ajax({
        type: 'GET',
        url: 'add_template/',
        headers: { Authorization: 'Bearer ' + token },
        success: function(data) {
            window.location.href = get_url + token
        },
        error: function(data) {
            if (data.status == 401) {
                getaccessTokenForUrl(get_url);
            }
            if (data.status == 403) {
                logout();
            }
        }
    })
}



function DeleteTemplate(id) {
    url = '/dashboard/template_management/delete_template/' + id

    $.ajax({
        url: url,
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + access },
        dataType: 'text',
        async: false,
        success: function(jsonData) {

            parsed_jsondata = JSON.parse(jsonData)
            M.toast({ html: parsed_jsondata.message, classes: 'green rounded' })
            setTimeout(function() {
                getTemplateDashboard();
            }, 2000);
        },
        error: function(xhr, status, error) {
            console.log(xhr)
            console.log(status)
            console.log(error)
            console.log(xhr.status)
            if (xhr.status == 401) {

                getaccessTokenDeleteUser();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }

    })
}

function deleteTemplate(id) {
    var confirmation = confirm("Are you sure?\nDo you want to delete this template?");
    if (confirmation == true) {
        DeleteTemplate(id)
    } else {
        return false
    }
}

function DownloadPdf(id) {
    window.location.href = id
}