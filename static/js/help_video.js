$(document).ready(function () {
    $(".upload_template_video").hide();
    SetPermissionsTemplateVideo();
})

var userDetails = getValues('UserDetails')
var access = userDetails.access


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

// Get the permissions from LocalStorge
function SetPermissionsTemplateVideo() {
    var userPermissions = getValues('UserPermissions')

    if (!jQuery.isEmptyObject(userPermissions)) {
        if (userPermissions.includes('user_management_page_get')) {
            $(".upload_template_video").show();
        }

    }
}
