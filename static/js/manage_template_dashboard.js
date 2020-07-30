
$(document).ready(function(){
    $( ".add_template" ).hide();
    SetPermissionsTemplateDashboard();
})

// Get the permissions from LocalStorge 
function SetPermissionsTemplateDashboard(){
    var userPermissions = getValues('UserPermissions')

    if(!jQuery.isEmptyObject(userPermissions)){
        if (userPermissions.includes('add_template_GET')){
            $( ".add_template" ).show();
        }
        
    }
}

var userDetails = getValues('UserDetails')
var access = userDetails.access

function getdashboard(){
    var token = access;
    var get_url = "/dashboard/?token="
    $.ajax({
        method : 'GET',
        url : get_url+token,
        success: function(data){
            window.location.href = get_url+token
        },
        error : function(xhr){
            if(xhr.status == 401){
                getaccessTokenForUrl(get_url);
            }
        }
    })  
}




function GetAddTemplatePage(){

    var token = access;
    var get_url = 'add_template/?token='
    $.ajax({
        type: 'GET',
        url: 'add_template/',
        headers: { Authorization: 'Bearer '+token},
        success: function (data) {
        window.location.href = get_url + token
        },
        error: function(data){
        if (data.status == 401) {
            getaccessTokenForUrl(get_url);
        }
        }
    })
}