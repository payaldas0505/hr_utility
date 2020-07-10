$(document).ready(function() {
    $('select').material_select();
    $('textarea#textarea1').characterCounter();
    $('input#telephone').characterCounter();
});

function RegisterUserForm(){
    option = $("#dropdownid option:selected").text();
    var formData = new FormData();
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('password', password);
    formData.append('dob', dob);
    formData.append('email',email );
    formData.append('telephone', telephone);
    formData.append('address', address);
    formData.append('gender', gender);
    formData.append('indian', indian);
    formData.append('option', option);
    // Attach file  
    formData.append('file', $('#document')[0].files[0]);

    $.ajax({
        url : "registeration_submit/",
        method : "POST",
        enctype: 'multipart/form-data',
        data : formData,
        contentType : false,    
        processData: false,
        async : false,
        success : function(jsonData){
            window.location.href = "/v2s/login/"
            alert(jsonData['message'])
            
        },
        error: function(xhr, status, error) {
            parsed_jsondata = JSON.parse(xhr.responseText)
            alert(parsed_jsondata.message)
            return false
          }
    })
}

function RegisterUser(){
    first_name = $('#first_name').val();
    last_name = $('#last_name').val();
    password = $('#password').val();
    dob = $('#dob').val();
    email = $('#email').val();
    telephone = $('#telephone').val();
    address = $('#textarea1').val();
    gender = $("input[name='gender']:checked", '#registeration_form').val();
    indian = $("input[name='indian']:checked", '#registeration_form').val();
    option = $("#dropdownid option:selected").val();
 
    if (indian){
        indian = true
    }
    else{
        indian = false
    }
    if (first_name == "") {
        alert("First name must be filled out");
        return false;
    }
    else if (last_name == "") {
        alert("Last name must be filled out");
        return false;
    }
    else if (password == "") {
        alert("Password must be filled out");
        return false;
    }
    else if (dob == "") {
        alert("Date of Birth must be filled out");
        return false;
    }
    else if (email == "") {
        alert("Email address must be filled out");
        return false;
    }
    else if (telephone == "") {
        alert("telephone must be filled out and should be valid number");
        return false;
    }
    else if (isNaN(telephone)){
        alert("Telephone should be number");
        // $("#telephone").css("color", "red");
        return false;
    }
    else if (address == "") {
        alert("Address must be filled out");
        return false;
    }
    else if (gender == "") {
        alert("Gender must be filled out");
        return false;
    }
    else if (option == "") {
        alert("Please select your qualification from the dropdown");
        return false;
    }
    else if ($('#document').get(0).files.length === 0) {
        alert("Please upload a file");
        return false;
    }
    else{
        RegisterUserForm()
    }
}
    
