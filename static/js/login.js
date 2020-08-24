jQuery(document).ready(function ($) {
    localStorage.setItem('language',1)
    var page_name = 'login'
    // get_labels(page_name)

    // on Change language from dropdown
    $(function() {
        $("#language_drop_down").on('change', function() {
                let language_id = $("#language_drop_down option:selected").val()
                localStorage.setItem("language", language_id)
                get_labels(page_name)
                $('#language_drop_down').not('.disabled').formSelect();

        });
    });

    // Get the languages
    $.ajax({
        url: '/get_languages/',
        type: 'GET',

        success:function(response){
            console.log(response)

            var next_id = $("#language_drop_down");
            $.each(response, function(key, value) {
                $(next_id).append($("<option></option>").attr("value", value.id).text(value.language_name));
            });
            $(next_id).not('.disabled').formSelect();
            var language_id = localStorage.getItem('language')
            if (language_id == null){
                language_id = 1
                localStorage.setItem("language", language_id)
            }
            get_labels(page_name)
            $('#language_drop_down').find('option[value='+language_id+']').prop('selected', true);
            $('select').not('.disabled').formSelect();

        },
        error: function(data){
            let obj = JSON.parse(data.responseText)
            M.toast({html: obj.error, classes: 'red rounded'})
        }

    });

});


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
            let parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
        }
    })
}

// check validations
function checkValidations(event) {
    if (!$('#username').val() && !$('#password').val()) {

        M.toast({ html: 'Please enter username and password', classes: 'red rounded' })
        return false;
    }
    else if (!$('#username').val()) {

        M.toast({ html: 'Please enter username', classes: 'red rounded' })
        return false;
    }
    else if (!$('#password').val()) {

        M.toast({ html: 'Please enter password', classes: 'red rounded' })
        return false;
    }
    else {
        submit();
    }

}

// submit login credentials
function submit() {

   let username = $('#username').val()
   let password = $('#password').val()

    $.ajax({
        type: 'POST',
        url: '/access_token/',
        data: {
            'username': username,
            'password': password,
        },
        success: function (result) {
            if (result.error){
                M.toast({ html: result.error, classes: 'red rounded' })
                return false
            }
            localStorage.setItem("UserDetails", JSON.stringify(result));
            window.location.href = "/dashboard/";
        },
        error: function (data) {
            localStorage.removeItem("User");
            let obj = JSON.parse(data.responseText)
            M.toast({ html: obj.detail, classes: 'red rounded' })
        }
    })
}

 // Get the input field
 var input = document.getElementById("password");

 // Execute a function when the user releases a key on the keyboard
 input.addEventListener("keyup", function(event) {
   // Cancel the default action, if needed
   event.preventDefault();
   // Number 13 is the "Enter" key on the keyboard
   if (event.keyCode === 13) {
     // Trigger the button element with a click
     document.getElementById("login_btn").click();
   }
 });
