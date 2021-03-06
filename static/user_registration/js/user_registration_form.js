jQuery(document).ready(function ($) {
    $('#view_image').hide();
    $('select').not('.disabled').formSelect();
    $('textarea#textarea1').characterCounter();
    $('input#telephone').characterCounter();
    get_labels('user_registration')
    var userDetails = getValues('UserDetails')
    var access = userDetails.access

    getUserRoleDropDown();

    // Check username avaliable in database
    $('#user_name').on('blur', function () {
        var user_name = $('#user_name').val();
        var get_url = '/dashboard/user_management/add_user/';
        if (user_name == '') {
            var user_name_state = false;
            return;
        }
        $.ajax({
            url: 'check_username/',
            headers: { Authorization: 'Bearer ' + access },
            type: 'post',
            data: {
                'user_name_check': 1,
                'user_name': user_name,
            },
            success: function (response) {

                if (response.message == 'taken') {
                    user_name_state = false;
                    $('#user_name').addClass("invalid");
                    M.toast({ html: response.toast_msg, classes: 'red rounded' })
                }
                else if (response.message == 'not_taken') {
                    username_state = true;
                    $('#username').addClass("valid");
                    M.toast({ html: response.toast_msg, classes: 'green darken-1 rounded' })
                }
            },
            error: function (xhr) {
                if (xhr.status == 401) {
                    getaccessTokenForUrl(get_url);
                }
                let parsed_jsondata = JSON.parse(xhr.responseText)
                M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
            }
        });
    });

    // Check emailid avaliable in database
    $('#email').on('blur', function () {
        var email = $('#email').val();
        var get_url = '/dashboard/user_management/add_user/';

        if (email == '') {
            var email_state = false;
            return;
        }
        $.ajax({
            url: 'check_email/',
            headers: { Authorization: 'Bearer ' + access },
            type: 'post',
            data: {
                'email_check': 1,
                'email': email,
            },
            success: function (response) {
                if (response.message == 'taken') {
                    email_state = false;
                    $('#email').addClass("invalid");
                    M.toast({ html: response.toast_msg, classes: 'red rounded' })
                }
                else if (response.message == 'not_taken') {
                    email_state = true;
                    $('#email').addClass("valid");
                }

            },
            error: function (xhr) {
                if (xhr.status == 401) {
                    getaccessTokenForUrl(get_url);
                }
                let parsed_jsondata = JSON.parse(xhr.responseText)
                M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
            }
        });
    });
});

var userDetails = getValues('UserDetails')
var access = userDetails.access

function getUserRoleDropDown() {

    //Get the role dropdown
    $.ajax({
        url: 'get_roles/',
        headers: { Authorization: 'Bearer ' + access },
        type: 'GET',

        success: function (response) {
            console.log(response)

            var next_id = $("#role_drop_down");
            $.each(response, function (key, value) {
                let role = '<span class="role_option_' + value.role_no + '">' + value.role_name + '</span>'
                $(next_id).append($("<option></option>").attr("value", value.role_no).html(role));
            });
            $(next_id).not('.disabled').formSelect();
        },
        error: function (data) {
            if (data.status == 401) {
                getaccessToken(getUserRoleDropDown);
            }
            let obj = JSON.parse(data.responseText)
            M.toast({ html: obj.error, classes: 'red rounded' })
        }

    });
}



// Save data into database
function RegisterUserForm() {

    var formData = new FormData();

    formData.append('user_name', user_name);
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirm_password', confirm_password);
    formData.append('role', role);
    formData.append('user_status', user_status);
    $.ajax({
        url: "/dashboard/user_management/add_user_data/",
        headers: { Authorization: 'Bearer ' + access },
        method: "POST",
        enctype: 'multipart/form-data',
        data: formData,
        contentType: false,
        processData: false,
        async: false,
        success: function (jsonData) {
            M.toast({ html: jsonData['message'], outDuration: 2000, classes: 'green rounded' })
            setTimeout(function() {
                window.location.href = "/dashboard/user_management/";
              }, 3000);
        },
        error: function (xhr) {
            if (xhr.status == 401) {

                getaccessToken(RegisterUserForm);
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
            setTimeout(function () {
                $("#submit_form").attr("disabled", false);
            }, 2000);
            return false
        }
    })
}

// Validation of fields
function RegisterUser() {

    $("#submit_form").attr("disabled", true);

     user_name = $('#user_name').val()
     first_name = $('#first_name').val();
     last_name = $('#last_name').val();
     email = $('#email').val();
     password = $('#password').val();
     confirm_password = $('#confirm_password').val();
     role = $("#role_drop_down option:selected").val();
     user_status = $("input[name='user_status']:checked", '#registration_form').val();
    if (user_status) {
        user_status = true
    }
    else {
        user_status = false
    }
    if (user_name == "") {
        $("#submit_form").attr("disabled", false);
        M.toast({ html: 'Username must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (first_name == "") {
        $("#submit_form").attr("disabled", false);
        M.toast({ html: 'First name must be filled out!', classes: 'red rounded' })
        return false;
    }

    else if (last_name == "") {

        $("#submit_form").attr("disabled", false);

        M.toast({ html: 'Last name must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (email == "") {
        $("#submit_form").attr("disabled", false);
        M.toast({ html: 'Email address must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (password == "") {
        $("#submit_form").attr("disabled", false);
        M.toast({ html: 'Password must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (confirm_password == "") {
        $("#submit_form").attr("disabled", false);
        M.toast({ html: 'Confirm Password must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (password != confirm_password) {
        $("#submit_form").attr("disabled", false);
        M.toast({ html: 'Password and confirm password fields do not match', classes: 'red rounded' })
        return false;
    }

    else if (role == "") {
        $("#submit_form").attr("disabled", false);
        M.toast({ html: 'Please assign role for the user from the dropdown!', classes: 'red rounded' })
        return false;
    }

    else {
        RegisterUserForm()
    }
}

function getUserDashboardDatatable() {
    var get_url = "/dashboard/user_management/"
    $.ajax({
    method : 'GET',
    headers: { Authorization: 'Bearer '+access},
    url : "/dashboard/user_management/",
    success: function(data){
        window.location.href = get_url
    },
    error : function(xhr){
        if(xhr.status == 401){
            getaccessTokenForUrl(get_url);
        }
    }
})
}
