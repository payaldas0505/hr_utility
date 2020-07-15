
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


function GetAddTemplatePage(){

    var token = localStorage.getItem("Token");
    $.ajax({
        type: 'GET',
        url: 'add_template/',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        success: function (data) {
        window.location.href = 'add_template/?token='+ token
        },
        error: function(data){
        if (data.status == 401) {
            getaccessTokenForAddTemplate();
        }
        }
    })
};

function getaccessTokenForAddTemplate(){
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
            window.location.href = "add_template/?token="+token;
          }, 500);

        },
        error: function(data){
           obj = JSON.parse(data.responseText)
           M.toast({html: obj.detail})
        }
  })

}