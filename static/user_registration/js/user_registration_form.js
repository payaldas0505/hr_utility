jQuery(document).ready(function($) {
    $('#view_image').hide();
    $('select').not('.disabled').formSelect();
    $('textarea#textarea1').characterCounter();
    $('input#telephone').characterCounter();
    var $crf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    
     //Get the role dropdown
     $.ajax({
        url: '/dashboard/user_management/add_user/get_roles/',
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
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.error, classes: 'red rounded'})
        }

    });
    // Get and set all the labels from backend
    var language_id = localStorage.getItem('language')
    // alert(language_id)
    $.ajax({
        type: 'POST',
        url: '/v2s/get_labels/',
        data : {
        	'page_name' : 'User_registration',
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


    // Check username avaliable in database
    $('#user_name').on('blur', function(){
        var user_name = $('#user_name').val();
        if (user_name == '') {
            user_name_state = false;
            return;
        }
        $.ajax({
          url: '/user/check_username/',
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
        url: '/user/check_email/',
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
    // option = $("#dropdownid option:selected").text();
    // role = $("#role_drop_down option:selected").text();
    var formData = new FormData();
    formData.append('profile_picture', $('#profile_picture')[0].files[0]);
    formData.append('user_name', user_name);
    formData.append('first_name', first_name);
    formData.append('middle_name', middle_name);
    formData.append('last_name', last_name);
    formData.append('password', password);
    formData.append('dob', dob);
    formData.append('email',email );
    formData.append('telephone', telephone);
    formData.append('address', address);
    formData.append('gender', gender);
    formData.append('indian', indian);
    formData.append('option', option);
    formData.append('role', "Customer");
    formData.append('resume', $('#resume')[0].files[0]);
    formData.append('pan_card', $('#pan_card')[0].files[0]);
    formData.append('adhar_card', $('#adhar_card')[0].files[0]);
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
         
            setTimeout(function() {
                window.location.href = '/v2s/login/';
              }, 3000);
        },
        error: function(xhr) {
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
    middle_name = $('#middle_name').val();
    password = $('#password').val();
    dob = $('#dob').val();
    email = $('#email').val();
    telephone = $('#telephone').val();
    address = $('#textarea1').val();
    gender = $("input[name='gender']:checked", '#registration_form').val();
    indian = $("input[name='indian']:checked", '#registration_form').val();
    option = $("#dropdownid option:selected").val();
    // role = $("#role_drop_down option:selected").val();
    
    if (indian){
        indian = true
    }
    else{
        indian = false
    }
    if ($('#profile_picture').get(0).files.length === 0) {
       
        get_toast('profile_picture_toast');

        // M.toast({html: 'Please upload your profile picture!', classes: 'red rounded'})
    }
    else if (user_name == "") {
        
        get_toast('user_name_toast');

        // M.toast({html: 'Username must be filled out!', classes: 'red rounded'})
        // return false;
    }
    else if (first_name == "") {
        
        get_toast('first_name_toast');

        // M.toast({html: 'First name must be filled out!', classes: 'red rounded'})
        // return false;
    }
    else if (middle_name == "") {
        
        get_toast('middle_name_toast');

        // M.toast({html: 'Middle name must be filled out!', classes: 'red rounded'})
        // return false;
    }
    else if (last_name == "") {
        
        get_toast('last_name_toast');

        // M.toast({html: 'Last name must be filled out!', classes: 'red rounded'})
        // return false;
    }
    else if (password == "") {
        
        get_toast('password_toast');

        // M.toast({html: 'Password must be filled out!', classes: 'red rounded'})
        // return false;
    }
    else if (dob == "") {
        
        get_toast('dob_toast');

        // M.toast({html: 'Date of Birth must be filled out!', classes: 'red rounded'})
        // return false;
    }
    else if (email == "") {
        
        get_toast('email_toast');

        // M.toast({html: 'Email address must be filled out!', classes: 'red rounded'})
        // return false;
    }
    else if (telephone == "") {
        
        get_toast('telephone_toast');

        // M.toast({html: 'telephone must be filled out and should be valid number!', classes: 'red rounded'})
        // return false;
    }
    else if (isNaN(telephone)){
    
        $("#telephone").css("color", "red");
        get_toast('num_telephone_toast');

        // M.toast({html: 'Telephone should be number!', classes: 'red rounded'})
       
        // return false;
    }
    else if (address == "") {
        
        get_toast('address_toast');

        // M.toast({html: 'Address must be filled out!', classes: 'red rounded'})
        // return false;
    }
    else if (gender == "") {
        
        get_toast('gender_toast');

        // M.toast({html: 'Gender must be filled out!', classes: 'red rounded'})
        // return false;
    }
    else if (option == "") {
        
        get_toast('option_toast');

        // M.toast({html: 'Please select your qualification from the dropdown!', classes: 'red rounded'})
        // return false;
    }
 
    else if ($('#resume').get(0).files.length === 0) {
        
        get_toast('resume_toast');

        // M.toast({html: 'Please upload your resume!', classes: 'red rounded'})
        // return false;
    }
    else if ($('#pan_card').get(0).files.length === 0) {
        
        get_toast('pan_card_toast');

        // M.toast({html: 'Please upload your Pan Card!', classes: 'red rounded'})
        // return false;
    }
    else if ($('#adhar_card').get(0).files.length === 0) {
        
        get_toast('adhar_card_toast');

        // M.toast({html: 'Please upload your Aadhar Card!', classes: 'red rounded'})
        // return false;
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

