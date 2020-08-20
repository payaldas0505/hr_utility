jQuery(document).ready(function ($) {
  var userDetails = localStorage.getItem("UserDetails")

  if (userDetails == null){
      window.location.href = "/login/"
  }
  else {
      var userDetails = getValues('UserDetails')
  }

$(".brand-logo").sideNav();


    // alert(localStorage.getItem("User"))


    $('#user').html('<i class="material-icons left">account_circle</i>' + userDetails.username);
    // var language_id = localStorage.getItem('language')
    // $.ajax({
    //     type: 'POST',
    //     url: '/get_labels/',
    //     data : {
    //     	'page_name' : 'Nav_bar',
    //     	'language_id' : language_id,
    // 	    },
    //     success: function (jsondata) {
    //         console.log(jsondata)
    //         for (const [key, value] of Object.entries(jsondata)) {
    //             console.log(key, value);
    //             $('.'+value.page_label_class_name).text(value.page_label_text);
    //           }
    //     },
    //     error: function(data){
    //         obj = JSON.parse(data.responseText)
    //         M.toast({html: obj.error, classes: 'red rounded'})
    //     }
    // });
});

function changepassword() {

    var token = userDetails.access
    var get_url = '/dashboard/get_change_password/?token='
    $.ajax({
        type: 'GET',
        url: '/dashboard/get_change_password/',
        headers: { Authorization: 'Bearer ' + token },
        success: function (data) {
            window.location.href = get_url + token
        },
        error: function (data) {
            if (data.status == 401) {
                getaccessTokenForUrl(get_url);
            }
        }
    })
};

//     $.ajax({
//         type: 'GET',
//         url: '/logout/',
//         headers: { Authorization: 'Bearer '+ localStorage.getItem("Token")},
//         success: function (result) {

//             localStorage.setItem("Token", result.access);
//             token = localStorage.getItem("Token")

//             setTimeout(function() {
//             window.location.href = "/dashboard/get_change_password/?token="+token;
//             }, 500);

//         },
//             error: function(data){
//             if (data.status == 401) {
//                 getaccessTokenlogout();

//             }
//         }
//     })
// }
// get access token when expired
// function getaccessTokenChangePassword(){

//     $.ajax({
//          type: 'POST',
//          url: '/refresh_token/',
//          data : {
//            'refresh' : localStorage.getItem("Refresh"),
//          },
//          success: function (result) {
//           localStorage.setItem("Token", result.access);
//           changepassword();
//          },
//          error: function(data){
//             obj = JSON.parse(data.responseText)
//             M.toast({html: obj.detail})
//          }
//    })
//   }

function getUserDashboard() {

    var token = userDetails.access
    var get_url = '/dashboard/user_management/?token='
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

// function getaccessTokenForUserDashboard(){
//     $.ajax({
//         type: 'POST',
//         url: '/refresh_token/',
//         data : {
//             'refresh' : localStorage.getItem("Refresh"),
//         },
//         success: function (result) {
//             localStorage.setItem("Token", result.access);
//             token = localStorage.getItem("Token")

//             setTimeout(function() {
//                 window.location.href = "/dashboard/user_management/?token="+token;
//             }, 500);

//         },
//         error: function(data){
//             obj = JSON.parse(data.responseText)
//             M.toast({html: obj.detail})
//         }
//     })
// }

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

// function getaccessTokenForTemplateDashboard(){
//     $.ajax({
//         type: 'POST',
//         url: '/refresh_token/',
//         data : {
//             'refresh' : localStorage.getItem("Refresh"),
//         },
//         success: function (result) {
//             localStorage.setItem("Token", result.access);
//             token = localStorage.getItem("Token")

//             setTimeout(function() {
//                 window.location.href = "/dashboard/template_management/?token="+token;
//                 }, 500);

//         },
//         error: function(data){
//             obj = JSON.parse(data.responseText)
//             M.toast({html: obj.detail})
//         }
//     })
// }

function closeSideBar() {

    var token = userDetails.access
    var get_url = "/dashboard/?token="
    $.ajax({
        method: 'GET',
        url: "/dashboard/?token=" + token,
        success: function (data) {
            window.location.href = get_url + token
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                getaccessTokenForUrl(get_url);
            }
        }
    })
}

// function GetAccessTokenForcloseSideBar(){
//     $.ajax({
//         type: 'POST',
//         url: '/refresh_token/',
//         data : {
//           'refresh' : localStorage.getItem("Refresh"),
//         },
//         success: function (result) {
//            localStorage.setItem("Token", result.access);
//            token = localStorage.getItem("Token")

//         setTimeout(function() {
//             window.location.href = "/dashboard/?token="+token;
//           }, 500);

//         },
//         error: function(data){
//            obj = JSON.parse(data.responseText)
//            M.toast({html: obj.detail})
//         }
//   })

// }
