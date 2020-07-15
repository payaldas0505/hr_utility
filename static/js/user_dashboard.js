
$(document).ready(function(){
    getUserRoleDropDown();
})

function getUserRoleDropDown(){

    //Get the role dropdown
    $.ajax({
        url: 'add_user/get_roles/',
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

function GetAddUserPage(){

    var token = localStorage.getItem("Token");
    $.ajax({
        type: 'GET',
        url: '/dashboard/user_management/add_user/',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        success: function (data) {
        window.location.href = '/dashboard/user_management/add_user/?token='+ token
        },
        error: function(data){
        if (data.status == 401) {
            getaccessTokenForAddUSer();
        }
        }
    })
};

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
        //    window.location.href = "/dashboard/?token="+token
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

function getaccessTokenForAddUSer(){
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
        //    window.location.href = "/dashboard/?token="+token
        setTimeout(function() {
            window.location.href = "/dashboard/user_management/add_user/?token="+token;
          }, 500);

        },
        error: function(data){
           obj = JSON.parse(data.responseText)
           M.toast({html: obj.detail})
        }
  })

}

function DeleteReport(id){
    url = 'edituserform/'+id
    
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
                
                window.location.href = "/dashboard/user_management/?token="+token 
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
    // GetPermissions()
}

function getDeleteReport(id){
    var confirmation = confirm("Are you sure?\nDo you want to delete this user?");
    if(confirmation == true){
        DeleteReport(id)
    }
    else{
        return false
    }
    // GetPermissions();
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
        //    window.location.href = "/dashboard/?token="+token
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

function getDashboardDatatable(){
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

function getViewReport(id){
    url = 'edituserform/'+id
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
                last_name = data[i].last_name 
                email = data[i].email
                user_status_edit = data[i].user_status
                role = data[i].role
                }
            $('#submit_edit_form').hide();
            $("#DisableDiv").find("*").prop('disabled', true);
            $('#SubmitEditUser').hide();
            $('#Dashboard_main').hide();
            $('#dashboardRegisterForm').show();
           
            $('#user_name_edit').val(user_name);
            $('#first_name_edit').val(first_name);
            $('#last_name_edit').val(last_name);
            $('#email_edit').val(email);
            $('#user_status_edit').prop('checked', user_status_edit);

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
    // GetPermissions();
}

function getEditReport(id){
    url = 'edituserform/'+id
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
                    last_name = data[i].last_name 
                    email = data[i].email
                    user_status_edit = data[i].user_status
                    role = data[i].role
                }

            $('#Dashboard_main').hide();
            $('#dashboardRegisterForm').show();
            $('#user_name_edit').val(user_name)
            $('#first_name_edit').val(first_name)
            $('#last_name_edit').val(last_name)
            $('#email_edit').val(email)
            $('#user_status_edit').val(user_status_edit)
            $('#user_status_edit').prop('checked', user_status_edit);
            $('#role_drop_down').find('option[value='+role+']').prop('selected', true);
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
    // GetPermissions()
}

function EditUserSave(user_name,first_name,
                      last_name,email,
                      user_status,role)
    {
        var edituserid = window.localStorage.getItem('editedUserId')
        option = $("#dropdownid option:selected").val();
        role = $("#role_drop_down option:selected").val();
        var formData = new FormData();

        formData.append('user_name', user_name);
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('email',email);
        formData.append('user_status', user_status);
        formData.append('role', role);

        url = 'edituserform/'+edituserid
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
                M.toast({html: jsonData.message, classes: 'green rounded'})    

                setTimeout(function() {
                window.location.reload();
                }, 3000);
            },
            error: function(xhr, status, error) {
                if (xhr.status == 401) {

                    getaccessTokenDatatable();
                }
                $("#submit_edit_form").attr("disabled", false);
                parsed_jsondata = JSON.parse(xhr.responseText)
                M.toast({html: parsed_jsondata.message, classes: 'red rounded'})
                return false
            }
        })
        // GetPermissions();
}


function EditUserValidation(){
    $("#submit_edit_form").attr("disabled", true);

    user_name = $('#user_name_edit').val()
    first_name = $('#first_name_edit').val();
    middle_name = $('#middle_name_edit').val();
    email = $('#email_edit').val();
    user_status = $("input[name='user_status_edit']:checked", '#registration_form').val();
    role = $("#role_drop_down option:selected").val();

    if (user_status){
        user_status = true
    }
    else{
        user_status = false
    }
    $('input:radio[name=sex]:nth(1)').attr('checked',true);

    if (user_name == "") {
        $("#submit_edit_form").attr("disabled", false);
        M.toast({html: 'Username must be filled out!', classes: 'red rounded'})
        return false;
    }
    else if (first_name == "") {
        $("#submit_edit_form").attr("disabled", false);
        M.toast({html: 'First name must be filled out!', classes: 'red rounded'})
        return false;
    }
   
    else if (last_name == "") {
        $("#submit_edit_form").attr("disabled", false);
        M.toast({html: 'Last name must be filled out!', classes: 'red rounded'})
        return false;
    }
    
    else if (email == "") {
        $("#submit_edit_form").attr("disabled", false);
        M.toast({html: 'Email address must be filled out!', classes: 'red rounded'})
        return false;
    }
   
    else if (role == "") {
        $("#submit_edit_form").attr("disabled", false);
        M.toast({html: 'Please assign an to the user!', classes: 'red rounded'})
        return false;
    }
    else{
        EditUserSave(user_name,first_name,
                    last_name,email,
                    user_status,role)
    }
}

// function GetPermissions(){
// window.localStorage.setItem('add_user', 'true')
// window.localStorage.setItem('edit_user', 'true')
// window.localStorage.setItem('view_user', 'true')
// window.localStorage.setItem('delete_user', 'true')
// var user_role_id = localStorage.getItem('RoleId')
// var user_id = localStorage.getItem('UserId')
//     content = {
//         user_role_id : user_role_id,
//         user_id : user_id
//     }
//     $.ajax({
//         url: '/usermanagement/permission',
//         type: 'post',
//         data: JSON.stringify(content),
//         success: function(response){
//             // localStorage.setItem("Role", response.level)
            
//             window.localStorage.setItem('add_user', response.add_user)
//             window.localStorage.setItem('edit_user', response.edit_user)
//             window.localStorage.setItem('view_user', response.view_user)
//             window.localStorage.setItem('delete_user', response.delete_user)

//             if (response.add_user == false){
//                 $( ".add_user" ).hide();
//             }
//             if (response.edit_user == false){
//                 $( ".edit_btn" ).hide();
//             }
//             if (response.delete_user == false){
//                 $( ".delete_btn" ).hide();
//             }
//             if (response.view_user == false){
//                 $( ".view_btn" ).hide();
//             }
//         },
//         error: function(xhr) {
//             parsed_json = JSON.parse(xhr.responseText)
//             M.toast({html: parsed_json.message, classes: 'red rounded'})
//         }
//       });
//     }

function getaccessTokenDashboard(){
    $.ajax({
         type: 'POST',
         url: '/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            var token = localStorage.getItem("Token");
            window.location.href = "/dashboard/?token="+token;

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
         url: '/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            var token = localStorage.getItem("Token");
            // window.location.href = "/dashboard/?token="+token;
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
         url: '/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            var token = localStorage.getItem("Token");
            // window.location.href = "/dashboard/?token="+token;
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
         url: '/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            var token = localStorage.getItem("Token");
            // window.location.href = "/dashboard/?token="+token;
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
        url: '/refresh_token/',
        data : {
          'refresh' : localStorage.getItem("Refresh"),
        },
        success: function (result) {
           localStorage.setItem("Token", result.access);
           // location.reload();
           var token = localStorage.getItem("Token");
           // window.location.href = "/dashboard/?token="+token;
        //    id = window.localStorage.getItem("editedUserId")
           EditUserValidation()
        },
        error: function(data){
           obj = JSON.parse(data.responseText)
           M.toast({html: obj.detail})
        }
  })
}
