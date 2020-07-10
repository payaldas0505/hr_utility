$(document).ready(function(){
    // setTimeout(function() {
    //     GetPermissions()
    //   }, 2000);

    //Get the qualification dropdown
    $.ajax({
        url: '/user/get_qualification/',
        type: 'GET',
      
        success:function(response){
            console.log(response)

            var next_id = $("#dropdownid");
            $.each(response, function(key, value) {
                qualification = '<span class="qualification_option_'+value.qualification_no+'">'+value.qualification_name+'</span>'
                $(next_id).append($("<option></option>").attr("value", value.qualification_no).html(qualification));
            });
            $(next_id).not('.disabled').formSelect();           
        },
        error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.error, classes: 'red rounded'})
        }

    });

    //Get the Roles dropdown
    $.ajax({
        url: '/user/get_roles/',
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
    var language_id = localStorage.getItem('language')
    $.ajax({
        type: 'POST',
        url: '/v2s/get_labels/',
        data : {
        	'page_name' : 'Add_user',
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
      
   // Get and set all the labels from backend
    $.ajax({
        type: 'POST',
        url: '/v2s/get_labels/',
        data : {
            'page_name' : 'Dashboard',
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
    GetPermissions()

})

function DownloadResume(id){
    window.location.href =id
    GetPermissions()
}
function DownloadPanCard(id){
    window.location.href =id
    GetPermissions()
}
function DownloadAdharCard(id){
    window.location.href =id
    GetPermissions()
}

function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $('#view_image').attr('src', e.target.result);
        $('#view_image').show();
      }
      reader.readAsDataURL(input.files[0]);
    }
}
  
$("#profile_picture_edit").change(function() {
    readURL(this);
    });


function DeleteReport(id){
    url = '/usermanagement/edituserform/'+id
    
    $.ajax({
        url : url,
        method : 'DELETE',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        dataType : 'text',
        async : false,
        success : function(jsonData){
            var token = localStorage.getItem("Token");
            parsed_jsondata = JSON.parse(jsonData)
            M.toast({html: parsed_jsondata.message, classes: 'green rounded'})
            setTimeout(function() {
                
                window.location.href = "/v2s/dashboard/?token="+token 
              }, 2000);
        },
        error: function(xhr, status, error) {
            console.log(xhr)
            console.log(status)
            console.log(error)
            console.log(xhr.status)
            if (xhr.status == 401) {

                getaccessTokenDeleteUser();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({html: parsed_jsondata.message, classes: 'red rounded'})
            return false
        }
        
    })
    GetPermissions()
}

function getDeleteReport(id){
    var confirmation = confirm("Are you sure?\nDo you want to delete this user?");
    if(confirmation == true){
        DeleteReport(id)
    }
    else{
        return false
    }
    GetPermissions();
}

function GetAccessTokenForBackButton(){
    $.ajax({
        type: 'POST',
        url: '/v2s/refresh_token/',
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
            window.location.href = "/v2s/dashboard/?token="+token;
          }, 500);

        },
        error: function(data){
           obj = JSON.parse(data.responseText)
           M.toast({html: obj.detail})
        }
  })

}

function getDashboardDatatable(){
    var token = localStorage.getItem("Token");
    $.ajax({
        method : 'GET',
        url : "/v2s/dashboard/?token="+token,
        success: function(data){
            window.location.href = "/v2s/dashboard/?token="+token
        },
        error : function(xhr){
            if(xhr.status == 401){
                GetAccessTokenForBackButton()
            }
        }
    })  
}

function getViewReport(id){
    url = '/usermanagement/edituserform/'+id
    window.localStorage.setItem('editedUserId', id)
    $.ajax({
        url : url,
        method : 'GET',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        dataType : 'text',
        async : false,
        success : function(jsonData){
            console.log(jsonData)
            parsed_json = JSON.parse(jsonData)
            data = parsed_json.message
            console.log(data)
            for(i=0;i<data.length;i++){
                    user_name = data[i].user_name
                    first_name = data[i].first_name
                    middle_name = data[i].middle_name
                    last_name = data[i].last_name
                    dob = data[i].dob
                    email = data[i].email
                    telephone = data[i].telephone
                    gender = data[i].gender
                    address = data[i].address
                    indian = data[i].indian
                    option = data[i].option
                    profile_picture = data[i].profile_picture
                    resume = data[i].resume
                    pan_card = data[i].pan_card
                    adhar_card = data[i].adhar_card
                    role = data[i].role
                }
            $('#HideProfileUpload').hide();
            $('#submit_form').hide();
            $('#hideUploadResume').hide();
            $('#hideUploadPancard').hide();
            $('#hideUploadAdharcard').hide();
            $('.helper-text').hide();
            $("#DisableDiv").find("*").prop('disabled', true);
            $('#SubmitEditUser').hide();
            $('#Dashboard_main').hide();
            $('#dashboardRegisterForm').show();
            $("#view_image").attr('src' , '/media/'+profile_picture);
            $('#profile_picture_edit_text').val(profile_picture);
            $('#user_name_edit').val(user_name);
            $('#first_name_edit').val(first_name);
            $('#middle_name_edit').val(middle_name);
            $('#last_name_edit').val(last_name);
            $('#dob_edit').val(dob);
            $('#email_edit').val(email);
            $('#telephone_edit').val(telephone);
            $('#textarea1_edit').val(address);
            $('#indian').prop('checked', indian);
            $('#'+gender+'').prop('checked', true);
            $('#resume_edit_file').val(resume);
            $('#pan_card_edit_file').val(pan_card);
            $('#adhar_card_edit_file').val(adhar_card);
            $('#dropdownid').find('option[value='+option+']').prop('selected', true);
            $('select').not('.disabled').formSelect();
            $('#role_drop_down').prop("disabled", true);
            $('#role_drop_down').find('option[value='+role+']').prop('selected', true);
            
            // var user_role_id = localStorage.getItem('RoleId')
            // if(user_role_id == 1){
            //     $('#role_drop_down').prop("disabled", false);
            // }
            $('select').not('.disabled').formSelect();
        },
        error: function(xhr, status, error) {
            if (xhr.status == 401) {

                getaccessTokenViewUser();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({html: parsed_jsondata.message, classes: 'red rounded'})
            return false
        }
    })
    GetPermissions();
}

function getEditReport(id){
    url = '/usermanagement/edituserform/'+id
    window.localStorage.setItem('editedUserId', id)
    $.ajax({
        url : url,
        method : 'GET',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        dataType : 'text',
        async : false,
        success : function(jsonData){
            console.log(jsonData)
            parsed_json = JSON.parse(jsonData)
            data = parsed_json.message
            console.log(data)
            for(i=0;i<data.length;i++){
                    user_name = data[i].user_name
                    first_name = data[i].first_name
                    middle_name = data[i].middle_name
                    last_name = data[i].last_name
                    dob = data[i].dob
                    email = data[i].email
                    telephone = data[i].telephone
                    gender = data[i].gender
                    address = data[i].address
                    indian = data[i].indian
                    option = data[i].option
                    profile_picture = data[i].profile_picture
                    resume = data[i].resume
                    pan_card = data[i].pan_card
                    adhar_card = data[i].adhar_card
                    role = data[i].role
                }

            $('#Dashboard_main').hide();
            $('#dashboardRegisterForm').show();
            $("#view_image").attr('src' , '/media/'+profile_picture);
            $('#profile_picture_edit_text').val(profile_picture)
            $('#user_name_edit').val(user_name)
            $('#first_name_edit').val(first_name)
            $('#middle_name_edit').val(middle_name)
            $('#last_name_edit').val(last_name)
            $('#dob_edit').val(dob)
            $('#email_edit').val(email)
            $('#telephone_edit').val(telephone)
            $('#textarea1_edit').val(address)
            $('#indian').val(indian)
            $('#resume_edit_file').val(resume)
            $('#pan_card_edit_file').val(pan_card)
            $('#adhar_card_edit_file').val(adhar_card)
            $('#indian').prop('checked', indian);
            $('#'+gender+'').prop('checked', true)
            $('#dropdownid').find('option[value='+option+']').prop('selected', true);
            $('select').not('.disabled').formSelect();
            $('#role_drop_down').prop("disabled", true);
            $('#role_drop_down').find('option[value='+role+']').prop('selected', true);
            
            var user_role_id = localStorage.getItem('RoleId')
            if(user_role_id == 1){
                $('#role_drop_down').prop("disabled", false);
            }
            $('select').not('.disabled').formSelect();
        },
        error: function(xhr, status, error) {
            console.log(xhr)
            console.log(status)
            console.log(error)
            console.log(xhr.status)
            if (xhr.status == 401) {

                getaccessTokenEditUser();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({html: parsed_jsondata.message, classes: 'red rounded'})
            return false
        }
    })
    GetPermissions()
}

function EditUserSave(user_name,first_name,last_name,
                    middle_name,password,dob,email,
                    telephone,address,gender,indian,
                    option,role)
    {
        var edituserid = window.localStorage.getItem('editedUserId')
        option = $("#dropdownid option:selected").val();
        role = $("#role_drop_down option:selected").val();
        var formData = new FormData();
        if ($('#profile_picture_edit').get(0).files.length === 0) {
        }
        else{
            formData.append('profile_picture', $('#profile_picture_edit')[0].files[0]);
        }

        if($('#resume_edit').get(0).files.length === 0){            
        }
        else{
            formData.append('resume', $('#resume_edit')[0].files[0]);
        }

        if($('#adhar_card_edit').get(0).files.length === 0){            
        }
        else{
            formData.append('adhar_card', $('#adhar_card_edit')[0].files[0]);
        }

        if($('#pan_card_edit').get(0).files.length === 0){            
        }
        else{
            formData.append('pan_card', $('#pan_card_edit')[0].files[0]);
        }

        formData.append('user_name', user_name);
        formData.append('first_name', first_name);
        formData.append('middle_name', middle_name);
        formData.append('last_name', last_name);
        formData.append('password', password);
        formData.append('dob', dob);
        formData.append('email',email);
        formData.append('telephone', telephone);
        formData.append('address', address);
        formData.append('gender', gender);
        formData.append('indian', indian);
        formData.append('option', option);
        formData.append('role', role);

        url = '/usermanagement/edituserform/'+edituserid
        $.ajax({
            url : url,
            method : "PUT",
            headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
            enctype: 'multipart/form-data',
            data : formData,
            contentType : false,    
            processData: false,
            async : false,
            success : function(jsonData){
                window.location.reload();
                M.toast({html: jsonData.message, classes: 'green rounded'})    
            },
            error: function(xhr, status, error) {
                if (xhr.status == 401) {

                    getaccessTokenDatatable();
                }
                parsed_jsondata = JSON.parse(xhr.responseText)
                M.toast({html: parsed_jsondata.message, classes: 'red rounded'})
                return false
            }
        })
        GetPermissions();
}


function EditUserValidation(){
    user_name = $('#user_name_edit').val()
    first_name = $('#first_name_edit').val();
    last_name = $('#last_name_edit').val();
    middle_name = $('#middle_name_edit').val();
    password = $('#password_edit').val();
    dob = $('#dob_edit').val();
    email = $('#email_edit').val();
    telephone = $('#telephone_edit').val();
    address = $('#textarea1_edit').val();
    gender = $("input[name='gender']:checked", '#registration_form').val();
    indian = $("input[name='indian']:checked", '#registration_form').val();
    option = $("#dropdownid option:selected").val();
    role = $("#role_drop_down option:selected").val();

    if (indian){
        indian = true
    }
    else{
        indian = false
    }
    $('input:radio[name=sex]:nth(1)').attr('checked',true);

    if (user_name == "") {
        M.toast({html: 'Username must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (first_name == "") {
        M.toast({html: 'First name must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (middle_name == "") {
        M.toast({html: 'Middle name must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (last_name == "") {
        M.toast({html: 'Last name must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (password == "") {
        M.toast({html: 'Password must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (dob == "") {
        M.toast({html: 'Date of Birth must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (email == "") {
        M.toast({html: 'Email address must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (telephone == "") {
        M.toast({html: 'telephone must be filled out and should be valid number!', classes: 'red rounded'})
        return false;
    }
    else if (isNaN(telephone)){
        M.toast({html: 'Telephone should be number!', classes: 'red rounded'})
        return false;
    }
    else if (address == "") {
        M.toast({html: 'Address must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (gender == "") {
        M.toast({html: 'Gender must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (option == "") {
        M.toast({html: 'Please select your qualification from the dropdown!', classes: 'red rounded'})
        return false;
    }
    else if (role == "") {
        M.toast({html: 'Please assign an to the user!', classes: 'red rounded'})
        return false;
    }
    else{
        EditUserSave(user_name,first_name,last_name,
                    middle_name,password,dob,email,
                    telephone,address,gender,
                    indian,option,role)
    }
}

function GetPermissions(){
window.localStorage.setItem('add_user', 'true')
window.localStorage.setItem('edit_user', 'true')
window.localStorage.setItem('view_user', 'true')
window.localStorage.setItem('delete_user', 'true')
var user_role_id = localStorage.getItem('RoleId')
var user_id = localStorage.getItem('UserId')
    content = {
        user_role_id : user_role_id,
        user_id : user_id
    }
    $.ajax({
        url: '/usermanagement/permission',
        type: 'post',
        data: JSON.stringify(content),
        success: function(response){
            // localStorage.setItem("Role", response.level)
            
            window.localStorage.setItem('add_user', response.add_user)
            window.localStorage.setItem('edit_user', response.edit_user)
            window.localStorage.setItem('view_user', response.view_user)
            window.localStorage.setItem('delete_user', response.delete_user)

            if (response.add_user == false){
                $( ".add_user" ).hide();
            }
            if (response.edit_user == false){
                $( ".edit_btn" ).hide();
            }
            if (response.delete_user == false){
                $( ".delete_btn" ).hide();
            }
            if (response.view_user == false){
                $( ".view_btn" ).hide();
            }
        },
        error: function(xhr) {
            parsed_json = JSON.parse(xhr.responseText)
            M.toast({html: parsed_json.message, classes: 'red rounded'})
        }
      });
}

function getaccessTokenDashboard(){
    $.ajax({
         type: 'POST',
         url: '/v2s/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            var token = localStorage.getItem("Token");
            window.location.href = "/v2s/dashboard/?token="+token;

         },
         error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
         }
   })
 }

 

 function getaccessTokenViewUser(){
    $.ajax({
         type: 'POST',
         url: '/v2s/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            var token = localStorage.getItem("Token");
            // window.location.href = "/v2s/dashboard/?token="+token;
            id = window.localStorage.getItem("editedUserId")
            getViewReport(id)
         },
         error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
         }
   })
 }


 

 function getaccessTokenEditUser(){
    $.ajax({
         type: 'POST',
         url: '/v2s/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            var token = localStorage.getItem("Token");
            // window.location.href = "/v2s/dashboard/?token="+token;
            id = window.localStorage.getItem("editedUserId")
            getEditReport(id)
         },
         error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
         }
   })
 }

 

 function getaccessTokenDeleteUser(){
    $.ajax({
         type: 'POST',
         url: '/v2s/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            var token = localStorage.getItem("Token");
            // window.location.href = "/v2s/dashboard/?token="+token;
            id = window.localStorage.getItem("editedUserId")
            DeleteReport(id)
         },
         error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
         }
   })
 }

 function getaccessTokenDatatable(){
    $.ajax({
        type: 'POST',
        url: '/v2s/refresh_token/',
        data : {
          'refresh' : localStorage.getItem("Refresh"),
        },
        success: function (result) {
           localStorage.setItem("Token", result.access);
           // location.reload();
           var token = localStorage.getItem("Token");
           // window.location.href = "/v2s/dashboard/?token="+token;
        //    id = window.localStorage.getItem("editedUserId")
           EditUserValidation()
        },
        error: function(data){
           obj = JSON.parse(data.responseText)
           M.toast({html: obj.detail})
        }
  })
}
