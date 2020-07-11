
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

// submit changed password 
function submit() {
    
    old_password = $('#old_password').val()
    new_password = $('#new_password').val()
    new_password_confirm = $('#new_password_confirm').val()
    // localStorage.setItem("User", username)
    $.ajax({
        type: 'POST',
        url: '/dashboard/change_password/',
        headers: { Authorization: 'Bearer '+ localStorage.getItem("Token")},
        data: {
            'old_password': old_password,
            'new_password': new_password,
            'new_password_confirm' : new_password_confirm,
        },
        success: function (result) {
            //  alert(result.role_id)
            localStorage.removeItem("Token");
            localStorage.removeItem("Role");
            localStorage.removeItem("User");
            localStorage.removeItem("view_user")
            localStorage.removeItem("add_user")
            localStorage.removeItem("edit_user")
            localStorage.removeItem("delete_user")
            // localStorage.setItem("RoleId", result.role_id);
            M.toast({ html: result.data, classes: 'Dark green rounded' })
            setTimeout(function() {
                window.location.href = "/login/"
            }, 2000);

        },
        error: function (data) {
            // localStorage.removeItem("User");
            alert(data.error)
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.error, classes: 'red rounded' })
            return false;
        }
    })
};

// validation check
function changepassword(){
    if (!$('#old_password').val() && !$('#new_password').val() && !$('#new_password_confirm').val()) {

        // get_toast('username_password_toast');

        M.toast({ html: 'Please enter all the fields', classes: 'red rounded' })
        return false;
    }
    else if (!$('#old_password').val()) {

        // get_toast('user_name_toast');

        M.toast({ html: 'Please enter old password', classes: 'red rounded' })
        return false;
    }
    else if (!$('#new_password').val()) {

        // get_toast('password_toast');

        M.toast({ html: 'Please enter new password', classes: 'red rounded' })
        return false;
    }
    else if (!$('#new_password_confirm').val()) {

        // get_toast('password_toast');

        M.toast({ html: 'Please enter new password confirmation', classes: 'red rounded' })
        return false;
    }
    else if ($('#new_password').val() !== $('#new_password_confirm').val()){
        alert('sad')
        M.toast({ html: 'New password and confirm password fields do not match', classes: 'red rounded' })
        return false;
     }
    else {
        submit();
    }
}