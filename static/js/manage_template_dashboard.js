
var userDetails = getValues('UserDetails')
var access = userDetails.access

function getdashboard(){
    var token = access;
    var get_url = "/dashboard/?token="
    $.ajax({
        method : 'GET',
        url : get_url+token,
        success: function(data){
            window.location.href = get_url+token
        },
        error : function(xhr){
            if(xhr.status == 401){
                getaccessTokenForUrl(get_url);
            }
        }
    })  
}

// function GetAccessTokenForBackButton(){
//     $.ajax({
//         type: 'POST',
//         url: '/refresh_token/',
//         data : {
//           'refresh' : localStorage.getItem("Refresh"),
//         },
//         success: function (result) {
//            localStorage.setItem("Token", result.access);
//            token = localStorage.getItem("Token")
//            // location.reload();
//         //    RegisterUserForm()
//            // return false
//         //    window.location.href = "/v2s/dashboard/?token="+token
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


function GetAddTemplatePage(){

    var token = access;
    var get_url = 'add_template/?token='
    $.ajax({
        type: 'GET',
        url: 'add_template/',
        headers: { Authorization: 'Bearer '+token},
        success: function (data) {
        window.location.href = get_url + token
        },
        error: function(data){
        if (data.status == 401) {
            getaccessTokenForUrl(get_url);
        }
        }
    })
};

// function getaccessTokenForAddTemplate(){
//     $.ajax({
//         type: 'POST',
//         url: '/refresh_token/',
//         data : {
//           'refresh' : localStorage.getItem("Refresh"),
//         },
//         success: function (result) {
//            localStorage.setItem("Token", result.access);
//            token = localStorage.getItem("Token")
//            // location.reload();
//         //    RegisterUserForm()
//            // return false
//         //    window.location.href = "/dashboard/?token="+token
//         setTimeout(function() {
//             window.location.href = "add_template/?token="+token;
//           }, 500);

//         },
//         error: function(data){
//            obj = JSON.parse(data.responseText)
//            M.toast({html: obj.detail})
//         }
//   })

// }