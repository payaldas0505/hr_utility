
$(document).ready(function(){
   
})
function getdashboard(){
    var token = localStorage.getItem("Token");
    $.ajax({
        method : 'GET',
        url : "/dashboard/?token="+token,
        success: function(data){
            window.location.href = "/dashboard/?token="+token
        },
        error : function(xhr){
            if(xhr.status == 401){
                GetAccessTokenForBackButton()
            }
        }
    })  
}

function GetAccessTokenForBackButton(){
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data : {
          'refresh' : localStorage.getItem("Refresh"),
        },
        success: function (result) {
           localStorage.setItem("Token", result.access);
           token = localStorage.getItem("Token")
           // location.reload();
        //    RegisterUserForm()
           // return false
        //    window.location.href = "/v2s/dashboard/?token="+token
        setTimeout(function() {
            window.location.href = "/dashboard/?token="+token;
          }, 500);

        },
        error: function(data){
           obj = JSON.parse(data.responseText)
           M.toast({html: obj.detail})
        }
  })

}

function GetAddUserPage(){

    var token = localStorage.getItem("Token");
    $.ajax({
        type: 'GET',
        url: '/dashboard/user_management/add_user/',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        success: function (data) {
        window.location.href = '/dashboard/user_management/add_user/?token='+ token
        },
        error: function(data){
        if (data.status == 401) {
            getaccessTokenForAddUSer();
        }
        }
    })
};

function getUserDashboardDatatable(){
        var token = localStorage.getItem("Token");
    $.ajax({
        method : 'GET',
        url : "/dashboard/user_management/?token="+token,
        success: function(data){
            window.location.href = "/dashboard/user_management/?token="+token
        },
        error : function(xhr){
            if(xhr.status == 401){
                GetAccessTokenForBackButton()
            }
        }
    })  
}

function GetAccessTokenForBackButton(){
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data : {
          'refresh' : localStorage.getItem("Refresh"),
        },
        success: function (result) {
           localStorage.setItem("Token", result.access);
           token = localStorage.getItem("Token")
           // location.reload();
        //    RegisterUserForm()
           // return false
        //    window.location.href = "/dashboard/?token="+token
        setTimeout(function() {
            window.location.href = "/dashboard/user_management/?token="+token;
          }, 500);

        },
        error: function(data){
           obj = JSON.parse(data.responseText)
           M.toast({html: obj.detail})
        }
  })

}

function getaccessTokenForAddUSer(){
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data : {
          'refresh' : localStorage.getItem("Refresh"),
        },
        success: function (result) {
           localStorage.setItem("Token", result.access);
           token = localStorage.getItem("Token")
           // location.reload();
        //    RegisterUserForm()
           // return false
        //    window.location.href = "/dashboard/?token="+token
        setTimeout(function() {
            window.location.href = "/dashboard/user_management/add_user/?token="+token;
          }, 500);

        },
        error: function(data){
           obj = JSON.parse(data.responseText)
           M.toast({html: obj.detail})
        }
  })

}