$(".brand-logo").sideNav();

 jQuery(document).ready(function($)
 {
    // alert(localStorage.getItem("User"))
    
    $('#user').html('<i class="material-icons left">account_circle</i>'+localStorage.getItem("User"));
    var language_id = localStorage.getItem('language')
    $.ajax({
        type: 'POST',
        url: '/get_labels/',
        data : {
        	'page_name' : 'Nav_bar',
        	'language_id' : language_id,
		    },
        success: function (jsondata) {
            console.log(jsondata)
            for (const [key, value] of Object.entries(jsondata)) {
                console.log(key, value);
                $('.'+value.page_label_class_name).text(value.page_label_text);
              }
        },
        error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.error, classes: 'red rounded'})
        }
    });
});

function changepassword(){
    var token = localStorage.getItem("Token");
    $.ajax({
        type: 'GET',
        url: '/dashboard/get_change_password/',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        success: function (data) {
        window.location.href = '/dashboard/get_change_password/?token='+ token
        },
        error: function(data){
        if (data.status == 401) {
            getaccessTokenChangePassword();
        }
        }
    })
};
  
function getaccessTokenChangePassword() {
    $.ajax({
        type: 'GET',
        url: '/logout/',
        headers: { Authorization: 'Bearer '+ localStorage.getItem("Token")},
        success: function (result) {

            localStorage.setItem("Token", result.access);
            token = localStorage.getItem("Token")

            setTimeout(function() {
            window.location.href = "/dashboard/get_change_password/?token="+token;
            }, 500);

        },
            error: function(data){
            if (data.status == 401) {
                getaccessTokenlogout();
                
            }
        }
    })
}

function getUserDashboard(){
    var token = localStorage.getItem("Token");
    $.ajax({
        type: 'GET',
        url: '/dashboard/user_management/',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        success: function (data) {
        window.location.href = '/dashboard/user_management/?token='+ token
        },
        error: function(data){
        if (data.status == 401) {
            getaccessTokenForUserDashboard();
        }
        }
    })
};

function getaccessTokenForUserDashboard(){
$.ajax({
    type: 'POST',
    url: '/refresh_token/',
    data : {
        'refresh' : localStorage.getItem("Refresh"),
    },
    success: function (result) {
        localStorage.setItem("Token", result.access);
        token = localStorage.getItem("Token")
       
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

function getTemplateDashboard(){
    var token = localStorage.getItem("Token");
    $.ajax({
        type: 'GET',
        url: '/dashboard/template_management/',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        success: function (data) {
        window.location.href = '/dashboard/template_management/?token='+ token
        },
        error: function(data){
        if (data.status == 401) {
            getaccessTokenForTemplateDashboard();
        }
        }
    })
};

function getaccessTokenForTemplateDashboard(){
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data : {
            'refresh' : localStorage.getItem("Refresh"),
        },
        success: function (result) {
            localStorage.setItem("Token", result.access);
            token = localStorage.getItem("Token")
    
            setTimeout(function() {
                window.location.href = "/dashboard/template_management/?token="+token;
                }, 500);

        },
        error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
        }
    })  
}

function closeSideBar(){
    var token = localStorage.getItem("Token");
    $.ajax({
        method : 'GET',
        url : "/dashboard/?token="+token,
        success: function(data){
            window.location.href = "/dashboard/?token="+token
        },
        error : function(xhr){
            if(xhr.status == 401){
                GetAccessTokenForcloseSideBar()
            }
        }
    })  
}

function GetAccessTokenForcloseSideBar(){
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data : {
          'refresh' : localStorage.getItem("Refresh"),
        },
        success: function (result) {
           localStorage.setItem("Token", result.access);
           token = localStorage.getItem("Token")
        
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