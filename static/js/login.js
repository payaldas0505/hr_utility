jQuery(document).ready(function ($) {

    // on Change language from dropdown
    // $(function() {
    //     $("#language_drop_down").on('change', function() {
    //         language_id = $("#language_drop_down option:selected").val()
    //             localStorage.setItem("language", language_id)
    //             get_labels(language_id)
    //             $('#language_drop_down').not('.disabled').formSelect();

    //     });
    // });

    //Get the languages
    // $.ajax({
    //     url: '/v2s/get_languages/',
    //     type: 'GET',

    //     success:function(response){
    //         console.log(response)

    //         var next_id = $("#language_drop_down");
    //         $.each(response, function(key, value) {
    //             $(next_id).append($("<option></option>").attr("value", value.id).text(value.language_name));
    //         });
    //         $(next_id).not('.disabled').formSelect();
    //         var language_id = localStorage.getItem('language')
    //         if (language_id == null){
    //             var language_id = 1
    //             localStorage.setItem("language", language_id)
    //         }
    //         get_labels(language_id)
    //         $('#language_drop_down').find('option[value='+language_id+']').prop('selected', true);
    //         $('select').not('.disabled').formSelect();

    //     },
    //     error: function(data){
    //         obj = JSON.parse(data.responseText)
    //         M.toast({html: obj.error, classes: 'red rounded'})
    //     }

    // });

});

// function get_labels(language_id){
//     var language_id = localStorage.getItem('language')
//     $.ajax({
//         type: 'POST',
//         url: '/v2s/get_labels/',
//         data : {
//         	'page_name' : 'login',
//         	'language_id' : language_id,
// 		    },
//         success: function (jsondata) {
//             console.log(jsondata)
//             for (const [key, value] of Object.entries(jsondata)) {
//                 console.log(key, value);
//                 $('.'+value.page_label_class_name).text(value.page_label_text);
//               }
//         },
//         error: function(data){
//             obj = JSON.parse(data.responseText)
//             M.toast({html: obj.error, classes: 'red rounded'})
//         }
//     });
// }

// Get toast messages from backend 
function get_toast(label) {

    $.ajax({
        url: 'toast_msg/',
        type: 'post',
        data: {
            'toast_label': label,
        },
        success: function (response) {

            M.toast({ html: response.message, classes: 'red rounded' })
            return false;

        },
        error: function (xhr) {
            parsed_jsondata = JSON.parse(xhr.responseText)
            // alert(parsed_jsondata.error)
            M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
        }
    })
}

// check validations
function checkValidations(event) {
    if (!$('#username').val() && !$('#password').val()) {

        // get_toast('username_password_toast');

        M.toast({ html: 'Please enter username and password', classes: 'red rounded' })
        return false;
    }
    else if (!$('#username').val()) {

        // get_toast('user_name_toast');

        M.toast({ html: 'Please enter username', classes: 'red rounded' })
        return false;
    }
    else if (!$('#password').val()) {

        // get_toast('password_toast');

        M.toast({ html: 'Please enter password', classes: 'red rounded' })
        return false;
    }
    else {
        submit();
    }

}

// submit login credentials
function submit() {
    
    username = $('#username').val()
    password = $('#password').val()

    // localStorage.setItem("User", username)
    $.ajax({
        type: 'POST',
        url: '/access_token/',
        data: {
            'username': username,
            'password': password,
        },
        success: function (result) {
            //  alert(result.role_id)
        
            localStorage.setItem("Token", result.access);
            localStorage.setItem("Refresh", result.refresh);
            localStorage.setItem("UserId", result.id);
            // localStorage.setItem("RoleId", result.role_id);
            window.location.href = "/dashboard/?token=" + result.access;
         
            
            // GetPermissions()
        },
        error: function (data) {
            localStorage.removeItem("User");
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.detail, classes: 'red rounded' })
        }
    })
};

// register user
function register() {
    window.location.href = "/user/register/"
}

//get password reset page
function getpasswordresetpage() {
    window.location.href = "/v2s/forgot_password/"
};

