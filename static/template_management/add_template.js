
function SubmitUploadWordTemplate(){
    $('#UploadTemplate').prop('disabled', true);
    var fd = new FormData();
    var files = $('#word_template')[0].files[0];
    
    fd.append('word_template',files);
    fd.append('word_name', word_name);

    $.ajax({
        url: '',
        headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        success: function(response){
            // console.log(response)
            $('#uploadTemplateDiv').hide();
            for(i=0;i<response[0].placeholder_list.length;i++){
                console.log(response[0].placeholder_list[i])
                console.log(response[0].placeholder_list[i].length)
                if(response[0].placeholder_list[i].includes('signature')){
                    input_type = 'file'
                }
                else{
                    input_type = 'text'
                }
                temp = '<p>'+response[0].placeholder_list[i]+'</p>'
                input = '<input id='+response[0].placeholder_list[i]+' type='+input_type+'></input>'
                console.log(temp)
                $('#templateFormAppend').append(temp)
                $('#templateFormAppend').append(input)
            }
            $('#templateForm').show();
        },
        error: function(xhr) {
            if (xhr.status == 401) {

                getaccessUploadWordTemplate();
            }
            
            parsed_jsondata = JSON.parse(xhr.responseText)
            // alert(parsed_jsondata.error)
            M.toast({html: parsed_jsondata.error, classes: 'red rounded'})
            setTimeout(function() {
                $("#UploadTemplate").attr("disabled", false);
              }, 2000);
            return false
        }

    });
}

// Validation of fields
function UploadWordTemplate(){

    $("#UploadTemplate").attr("disabled", true);

    var word_name = $('#word_name').val();
    
    if (word_name == "") {
        
        $("#UploadTemplate").attr("disabled", false);
        M.toast({html: 'Please enter the name for the document!', classes: 'red rounded'})
        return false;
    }
    else if ($('#word_template').get(0).files.length === 0) {
        $("#UploadTemplate").attr("disabled", false);
        M.toast({html: 'Please upload file!', classes: 'red rounded'})
        return false;
    }
    
    else{
        SubmitUploadWordTemplate(word_name)
    }
}


function getTemplateDashboard(){
    var token = localStorage.getItem("Token");
$.ajax({
    method : 'GET',
    url : "/dashboard/template_management/?token="+token,
    success: function(data){
        window.location.href = "/dashboard/template_management/?token="+token
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

function getaccessUploadWordTemplate(){
    $.ajax({
         type: 'POST',
         url: '/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            SubmitUploadWordTemplate()
            // return false

         },
         error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
         }
   })
 }