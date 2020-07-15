jQuery(document).ready(function($) {
    $('#view_image').hide();
    $('select').not('.disabled').formSelect();
    $('textarea#textarea1').characterCounter();
    $('input#telephone').characterCounter();
    
    getUserRoleDropDown();
     

    // Check username avaliable in database
    $('#user_name').on('blur', function(){
        var user_name = $('#user_name').val();
        if (user_name == '') {
            user_name_state = false;
            return;
        }
        $.ajax({
          url: 'check_username/',
          headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
          type: 'post',
          data: {
              'user_name_check' : 1,
              'user_name' : user_name,
          },
          success: function(response){

            if (response.message == 'taken' ) {
                user_name_state = false;
                $('#user_name').addClass("invalid");
                M.toast({html: response.toast_msg , classes: 'red rounded'})
            }
            else if (response.message == 'not_taken') {
                username_state = true;
                $('#username').addClass("valid");
                M.toast({html: response.toast_msg, classes: 'green darken-1 rounded'})
            }
          },
          error: function(xhr) {
            
            parsed_jsondata = JSON.parse(xhr.responseText)
            // alert(parsed_jsondata.error)
            M.toast({html: parsed_jsondata.error, classes: 'red rounded'})
        }
        });
    });	

    // Check emailid avaliable in database
    $('#email').on('blur', function(){
        var email = $('#email').val();
        
        if (email == '') {
            email_state = false;
            return;
        }
        $.ajax({
        url: 'check_email/',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        type: 'post',
        data: {
            'email_check' : 1,
            'email' : email,
        },
        success: function(response){
            if (response.message == 'taken' ) {
                email_state = false;
                $('#email').addClass("invalid");
                M.toast({html: response.toast_msg, classes: 'red rounded'})
            }
            else if (response.message == 'not_taken') {
                email_state = true;
                $('#email').addClass("valid");
            }
           
        },
        error: function(xhr) {
            parsed_jsondata = JSON.parse(xhr.responseText)
            // alert(parsed_jsondata.error)
            M.toast({html: parsed_jsondata.error, classes: 'red rounded'})
        }
        });
    });
});


function getUserRoleDropDown(){

    //Get the role dropdown
    $.ajax({
        url: 'get_roles/',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        type: 'GET',

        success:function(response){
            console.log(response)

            var next_id = $("#role_drop_down");
            $.each(response, function(key, value) {
                role = '<span class="role_option_'+value.role_no+'">'+value.role_name+'</span>'
                $(next_id).append($("<option></option>").attr("value", value.role_no).html(role));
            });
            $(next_id).not('.disabled').formSelect();           
        },
        error: function(data){
            if (data.status == 401) {
                getaccessTokenForGetRoles();
            }
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.error, classes: 'red rounded'})
        }

    });
}

function getaccessTokenForGetRoles(){
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
            getUserRoleDropDown()
          }, 500);

        },
        error: function(data){
           obj = JSON.parse(data.responseText)
           M.toast({html: obj.detail})
        }
  })
}
// Get toast messages from backend 
function get_toast(label){
    $("#submit_form").attr("disabled", false);

    $.ajax({
        url: '/v2s/toast_msg/',
        type: 'post',
        data: {
            'toast_label' : label,
        },
        success: function(response){
        
        M.toast({html: response.message, classes: 'red rounded'})
        return false;
           
        },
        error: function(xhr) {
            parsed_jsondata = JSON.parse(xhr.responseText)
            // alert(parsed_jsondata.error)
            M.toast({html: parsed_jsondata.error, classes: 'red rounded'})
        }
    })
}
    
// Preview of image function
function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $('#view_image').attr('src', e.target.result);
        $('#view_image').show();
      }
      reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
  }
  
  $("#profile_picture").change(function() {
    readURL(this);
  });


// Save data into database
function RegisterUserForm(){

    var formData = new FormData();
    
    formData.append('user_name', user_name);
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('email',email );
    formData.append('password', password);
    formData.append('confirm_password', confirm_password);
    formData.append('role', role);
    formData.append('user_status', user_status);
    $.ajax({
        url : "",
        method : "POST",
        enctype: 'multipart/form-data',
        data : formData,
        contentType : false,    
        processData: false,
        async : false,
        success : function(jsonData){
            M.toast({html: jsonData['message'], outDuration: 2000, classes: 'green rounded'})
            var token = localStorage.getItem("Token");
            setTimeout(function() {
                window.location.href = "/dashboard/user_management/?token="+token;
              }, 3000);
        },
        error: function(xhr) {
            if (xhr.status == 401) {

                getaccessAddUser();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            // alert(parsed_jsondata.error)
            M.toast({html: parsed_jsondata.error, classes: 'red rounded'})
            setTimeout(function() {
                $("#submit_form").attr("disabled", false);
              }, 2000);
            return false
        }
    })
}

// Validation of fields
function RegisterUser(){

    $("#submit_form").attr("disabled", true);

    user_name = $('#user_name').val()
    first_name = $('#first_name').val();
    last_name = $('#last_name').val();
    email = $('#email').val();
    password = $('#password').val();
    confirm_password = $('#confirm_password').val();
    role = $("#role_drop_down option:selected").val();
    user_status = $("input[name='user_status']:checked", '#registration_form').val();
    if (user_status){
        user_status = true
    }
    else{
        user_status = false
    }
    if (user_name == "") {
        
        // get_toast('user_name_toast');
        $("#submit_form").attr("disabled", false);
        M.toast({html: 'Username must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (first_name == "") {
        
        // get_toast('first_name_toast');
        $("#submit_form").attr("disabled", false);
        M.toast({html: 'First name must be filled out!', classes: 'red rounded'})
        return false;
    }
 
    else if (last_name == "") {

        $("#submit_form").attr("disabled", false);
        // get_toast('last_name_toast');

        M.toast({html: 'Last name must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (email == "") {
        
        // get_toast('email_toast');
        $("#submit_form").attr("disabled", false);
        M.toast({html: 'Email address must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (password == "") {
        
        // get_toast('password_toast');
        $("#submit_form").attr("disabled", false);
        M.toast({html: 'Password must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (confirm_password == "") {
        
        // get_toast('confirm_password_toast');
        $("#submit_form").attr("disabled", false);
        M.toast({html: 'Password must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (password != confirm_password){
        // alert("check match condition")
        $("#submit_form").attr("disabled", false);
        M.toast({ html: 'Password and confirm password fields do not match', classes: 'red rounded' })
        return false;
    }

    else if (role == "") {
        
        // get_toast('role_toast');
        $("#submit_form").attr("disabled", false);
        M.toast({html: 'Please assign role for the user from the dropdown!', classes: 'red rounded'})
        return false;
    }
    
    else{
        RegisterUserForm()
    }
}
    
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

function getaccessAddUser(){
    $.ajax({
         type: 'POST',
         url: '/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            RegisterUserForm()
            // return false

         },
         error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
         }
   })
 }
