$(document).ready(function (){
    $('#word_name').focus()
    sessionStorage.clear();
})
var userDetails = getValues('UserDetails')
var access = userDetails.access

function SubmitUploadWordTemplate(){
    $('#UploadTemplate').prop('disabled', true);
    var fd = new FormData();
    var files = $('#word_template')[0].files[0];
    var word_name = $('#word_name').val()
    fd.append('word_template',files);
    fd.append('word_name', word_name);

    $.ajax({
        url: '',
        headers: { Authorization: 'Bearer '+ access},
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        success: function(response){
            // console.log(response)
            // $('#uploadTemplateDiv').hide();
            // alert(response[0].filename)
            sessionStorage.setItem('filename', response[1].filename)
            var id = []
            for(i=0;i<response[0].placeholder_list.length;i++){
                console.log(response[0].placeholder_list[i])
                console.log(response[0].placeholder_list[i].length)
                if(response[0].placeholder_list[i].includes('image')){
                    input_type = 'file'
                }
                else{
                    input_type = 'text'
                }
                div_class_start = '<div class="row"><div class="input-field col s12"><i class="material-icons prefix">edit</i>'
                // temp = '<p>'+response[0].placeholder_list[i]+'</p>'
                input = '<input id='+response[0].placeholder_list[i]+' type='+input_type+' class="validate" required="" aria-required="true">'
                label = '<label for='+response[0].placeholder_list[i]+'>'+response[0].placeholder_list[i]+'</label>'
                div_class_end = '</div></div>'
                $('#templateFormAppend').append(div_class_start)
                $('#templateFormAppend').append(input)
                $('#templateFormAppend').append(label)
                $('#templateFormAppend').append(div_class_end)
                id.push(response[0].placeholder_list[i])
            }
            submit_button = '<div class="row"><div class="col push-s3"><button class="btn btn-primary" type="submit" onclick="FieldUploadWordTemplate(event)">Upload<i class="material-icons right">send</i></button></div></div>'
            $('#templateFormAppend').append(submit_button)
            $('#templateForm').show();
            sessionStorage.setItem("Id", JSON.stringify(id));
        },
        error: function(xhr) {
            if (xhr.status == 401) {

                getaccessToken(SubmitUploadWordTemplate);
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

$('#word_template').change(function(){    
    sessionStorage.clear()
    $("#templateFormAppend").empty();

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
        SubmitUploadWordTemplate()
    }
})


function getTemplateDashboard(){
    var token = access;
    var get_url = "/dashboard/template_management/?token="
    $.ajax({
        method : 'GET',
        url : get_url+token,
        success: function(data){
            window.location.href = get_url+token
        },
        error : function(xhr){
            if(xhr.status == 401){
                getaccessTokenForUrl(get_url)
            }
        }
    })  
}

// function GetAccessTokenForBackButton(){
//     $.ajax({
//         type: 'POST',
//         url: '/refresh_token/',
//         data : {
//           'refresh' : localStorage.getItem("Refresh"),
//         },
//         success: function (result) {
//            localStorage.setItem("Token", result.access);
//            token = access
           
//             setTimeout(function() {
//                 window.location.href = "/dashboard/user_management/?token="+token;
//             }, 500);

//         },
//         error: function(data){
//            obj = JSON.parse(data.responseText)
//            M.toast({html: obj.detail})
//         }
//   })

// }

// function getaccessUploadWordTemplate(){
//     $.ajax({
//          type: 'POST',
//          url: '/refresh_token/',
//          data : {
//            'refresh' : localStorage.getItem("Refresh"),
//          },
//          success: function (result) {
//             localStorage.setItem("Token", result.access);
//             // location.reload();
//             SubmitUploadWordTemplate()
//             // return false

//          },
//          error: function(data){
//             obj = JSON.parse(data.responseText)
//             M.toast({html: obj.detail})
//          }
//    })
//  }

 function SaveFields(){
     
    $('#UploadTemplate').prop('disabled', true);
    var filename = sessionStorage.getItem('filename')
    var fd = new FormData();
    // var files = $('#signature')[0].files[0];
    var signature = $('#signature').val();
    var name = $('#name').val();
    var email = $('#email').val();
    var address = $('#address').val();
    var phone = $('#phone').val();
    // var signature = $('#signature').val();
    fd.append('signature', signature);
    fd.append('name', name);
    fd.append('email', email);
    fd.append('address', address)
    fd.append('phone', phone)
    fd.append('filename', filename)
   
    // alert(name)
    // data = {
    //     templatejson: {
    //         name: "Payal",
    //         email: "payal@m"
    //     },
    //     fileName:"test.docx"
    // }
    console.log(fd)
    // event.preventDefault();
    $.ajax({
        url: 'fill/',
        headers: { Authorization: 'Bearer '+access},
        method : "POST",
        enctype: 'multipart/form-data',
        data : fd,
        contentType : false,    
        processData: false,
        async : false,
        success: function(response){
            M.toast({html: 'success', classes: 'green rounded'})
            return false
            // console.log(response)
            // $('#uploadTemplateDiv').hide();
            // var id = []
            // for(i=0;i<response[0].placeholder_list.length;i++){
            //     console.log(response[0].placeholder_list[i])
            //     console.log(response[0].placeholder_list[i].length)
            //     if(response[0].placeholder_list[i].includes('signature')){
            //         input_type = 'file'
            //     }
            //     else{
            //         input_type = 'text'
            //     }
            //     div_class_start = '<div class="row"><div class="input-field col s12"><i class="material-icons prefix">edit</i>'
            //     // temp = '<p>'+response[0].placeholder_list[i]+'</p>'
            //     input = '<input id='+response[0].placeholder_list[i]+' type='+input_type+' class="validate" required="" aria-required="true">'
            //     label = '<label for='+response[0].placeholder_list[i]+'>'+response[0].placeholder_list[i]+'</label>'
            //     div_class_end = '</div></div>'
            //     $('#templateFormAppend').append(div_class_start)
            //     $('#templateFormAppend').append(input)
            //     $('#templateFormAppend').append(label)
            //     $('#templateFormAppend').append(div_class_end)
            //     id.push(response[0].placeholder_list[i])
            // }
            // submit_button = '<div class="row"><div class="col push-s3"><button class="btn btn-primary" id="UploadTemplate" type="submit" onclick="FieldUploadWordTemplate()">Upload<i class="material-icons right">send</i></button></div></div>'
            // $('#templateFormAppend').append(submit_button)
            // $('#templateForm').show();
            // sessionStorage.setItem("Id", JSON.stringify(id));
            
        },
        error: function(xhr) {
            if (xhr.status == 401) {

                getaccessToken(SaveFields)
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


function FieldUploadWordTemplate(event){
    // retrieving our data and converting it back into an array
    event.preventDefault();
    var retrievedData = sessionStorage.getItem("Id");
    var id = JSON.parse(retrievedData);

    values = []
    $.each(id, function( i, l ){
        console.log(l)
        var id_name = $($.trim('#')+$.trim(l)).val()
        console.log(id_name)
        if ( id_name == ""){
            M.toast({html: "Please fill the " +l+ "field", classes: 'red rounded' })
            return false;
        }
        
            
      });

    SaveFields(); 
    //   alert(values)

    

}