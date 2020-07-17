
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

// submit changed password 
function save_password() {
    $('#password_change_btn').attr("disabled", true);
    var old_password = $('#old_password').val()
    var new_password = $('#new_password').val()
    var new_password_confirm = $('#new_password_confirm').val()
    // localStorage.setItem("User", username)
    $.ajax({
        type: 'POST',
        url: '/dashboard/save_password/',
        headers: { Authorization: 'Bearer '+ localStorage.getItem("Token")},
        data: {
            'old_password': old_password,
            'new_password': new_password,
            'new_password_confirm' : new_password_confirm,
        },
        success: function (result) {
            window.localStorage.clear();
            M.toast({ html: result.data, classes: 'Dark green rounded' })
            setTimeout(function() {
                window.location.href = "/login/"
            }, 2000);

        },
        error: function (data) {
            // localStorage.removeItem("User");
            if (xhr.status == 401) {

                getaccessChangePassword();
            }
            $('#password_change_btn').attr("disabled", false);
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.error, classes: 'red rounded' })
            return false;
        }
    })
};

// validation check
function changepassword(){
    var old_password = $('#old_password').val()
    var new_password = $('#new_password').val()
    var new_password_confirm = $('#new_password_confirm').val()

    $('#password_change_btn').attr("disabled", true);
    if (!old_password || !new_password || !new_password_confirm) {

        // get_toast('username_password_toast');
        $('#password_change_btn').attr("disabled", false);
        M.toast({ html: 'Please enter all the fields', classes: 'red rounded' })
        return false;
    }
    else if (!old_password) {

        // get_toast('user_name_toast');
        $('#password_change_btn').attr("disabled", false);
        M.toast({ html: 'Please enter old password', classes: 'red rounded' })
        return false;
    }
    else if (!new_password) {

        // get_toast('password_toast');
        $('#password_change_btn').attr("disabled", false);
        M.toast({ html: 'Please enter new password', classes: 'red rounded' })
        return false;
    }
    else if (!new_password_confirm) {

        // get_toast('password_toast');
        $('#password_change_btn').attr("disabled", false);
        M.toast({ html: 'Please enter new password confirmation', classes: 'red rounded' })
        return false;
    }
    else if (new_password != new_password_confirm){
        // alert("check match condition")
        $('#password_change_btn').attr("disabled", false);
        M.toast({ html: 'New password and confirm password fields do not match', classes: 'red rounded' })
        
        return false;
    }

    else {
        save_password();
    }
}

function getaccessChangePassword(){
    $.ajax({
         type: 'POST',
         url: '/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            save_password()
            // return false

         },
         error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
         }
   })
 }
