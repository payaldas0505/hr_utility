jQuery(document).ready(function ($) {
  var userDetails = localStorage.getItem("UserDetails")

  if (userDetails == null){
      window.location.href = "/login/"
  }
  else {
      var userDetails = getValues('UserDetails')
  }

    $(".brand-logo").sideNav();



    $('#user').html('<i class="material-icons left">account_circle</i>' + userDetails.username);

});

function changepassword() {

    var token = userDetails.access
    var get_url = '/dashboard/get_change_password/'
    $.ajax({
        type: 'GET',
        url: '/dashboard/get_change_password/',
        headers: { Authorization: 'Bearer ' + token },
        success: function (data) {
            window.location.href = get_url
        },
        error: function (data) {
            if (data.status == 401) {
                getaccessTokenForUrl(get_url);
            }
        }
    })
};


function getUserDashboard() {

    var token = userDetails.access
    var get_url = '/dashboard/user_management/'
    $.ajax({
        type: 'GET',
        url: '/dashboard/user_management/',
        headers: { Authorization: 'Bearer ' + token },
        success: function (data) {
            window.location.href = '/dashboard/user_management/'
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


function getTemplateDashboard() {

    var token = userDetails.access
    var get_url = '/dashboard/template_management/'
    $.ajax({
        type: 'GET',
        url: '/dashboard/template_management/',
        headers: { Authorization: 'Bearer ' + token },
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


function closeSideBar() {

    var token = userDetails.access
    var get_url = "/dashboard/"
    $.ajax({
        method: 'GET',
        url: "/dashboard/",
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
