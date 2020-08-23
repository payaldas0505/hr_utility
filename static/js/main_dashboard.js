$(document).ready(function () {
    $(".user_management").hide();
    $(".template_management").hide();
    $('#Template-dropdown').hide();
    $('#templateDropdownForm').hide();
    $('#Template-Dropdown-Header').hide();
    $('.dropdown-back-button').hide();
    $('.save-cancel-button').hide();
    $('#ViewDivTemplate').hide();
    $('#EditDivTemplate').hide();
    $('#pdf_fill').hide();
    $('#pdf_edit').hide();
    $('#pdf_save_cancel').hide();

    $('select').formSelect();

    if (localStorage.getItem("UserPermissions") === null) {
        GetPermissions()
    }
    else {
        SetPermissionsUserDashboard()
    }

    DocumentTemplateDropdown()

    // var language_id = localStorage.getItem('language')
    // $.ajax({
    //     type: 'POST',
    //     url: '/get_labels/',
    //     data : {
    //     	'page_name' : 'Add_user',
    //     	'language_id' : language_id,
    // 	    },
    //     success: function (jsondata) {
    //         console.log(jsondata)
    //         for (const [key, value] of Object.entries(jsondata)) {
    //             console.log(key, value);
    //             $('.'+value.page_label_class_name).text(value.page_label_text);
    //           }
    //     },
    //     error: function(data){
    //         obj = JSON.parse(data.responseText)
    //         M.toast({html: obj.error, classes: 'red rounded'})
    //     }
    // });

    // Get and set all the labels from backend
    // $.ajax({
    //     type: 'POST',
    //     url: '/get_labels/',
    //     data : {
    //         'page_name' : 'Dashboard',
    //         'language_id' : language_id,
    //         },
    //     success: function (jsondata) {
    //         console.log(jsondata)
    //         for (const [key, value] of Object.entries(jsondata)) {
    //             console.log(key, value);
    //             $('.'+value.page_label_class_name).text(value.page_label_text);
    //         }
    //     },
    //     error: function(data){
    //         obj = JSON.parse(data.responseText)
    //         M.toast({html: obj.error, classes: 'red rounded'})
    //     }
    // });


})

function DocumentTemplateDropdown() {
    $.ajax({
        url: '/dashboard/document_template_dropdown/',
        headers: { Authorization: 'Bearer ' + userDetails.access },
        type: 'GET',

        success: function (response) {
            console.log(response)
            console.log(response.message.length)
            for (i = 0; i < response.message.length; i++) {
                temp = '<option value=' + response.message[i].id + '>' + response.message[i].word_name + '</option>'
                $('#Template-dropdown-select').append(temp)
                $('select').formSelect();
            }

        },
        error: function (xhr) {
            parsed_json = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_json.message, classes: 'red rounded' })
        }
    });
}

function GetPermissions() {
    $.ajax({
        url: 'permission',
        headers: { Authorization: 'Bearer ' + userDetails.access },
        type: 'GET',

        success: function (response) {

            localStorage.setItem("UserPermissions", JSON.stringify(response));
            console.log(response)

            SetPermissionsUserDashboard();

        },
        error: function (xhr) {
            parsed_json = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_json.message, classes: 'red rounded' })
        }
    });
}

function SetPermissionsUserDashboard() {
    var userPermissions = getValues('UserPermissions')

    if (!jQuery.isEmptyObject(userPermissions)) {
        if (userPermissions.includes('user_management_page_get')) {
            $(".user_management").show();
        }
        if (userPermissions.includes('template_management_page_get')) {
            $(".template_management").show();
        }
    }
}

var userDetails = getValues('UserDetails')
var user_role_id = userDetails.role_id

function DownloadFillTemplate(id) {
    window.location.href = '/media/filled_user_template/' + id + '.pdf'
    GetPermissions()
}
function DownloadPanCard(id) {
    window.location.href = id
    GetPermissions()
}
function DownloadAdharCard(id) {
    window.location.href = id
    GetPermissions()
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#view_image').attr('src', e.target.result);
            $('#view_image').show();
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$("#profile_picture_edit").change(function () {
    readURL(this);
});



function DeleteFillTemplate(id) {
    url = '/dashboard/fill_template_detail/' + id

    $.ajax({
        url: url,
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + userDetails.access },
        dataType: 'text',
        async: false,
        success: function (jsonData) {
            var token = localStorage.getItem("Token");
            parsed_jsondata = JSON.parse(jsonData)
            M.toast({html: parsed_jsondata.message, classes: 'green rounded'})
            setTimeout(function() {

                window.location.href = "/dashboard/"
              }, 2000);
        },
        error: function (xhr, status, error) {
            console.log(xhr)
            console.log(status)
            console.log(error)
            console.log(xhr.status)
            if (xhr.status == 401) {

                getaccessTokenDeleteUser();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }

    })
    GetPermissions()
}

function getDeleteFillTemplate(id) {
    var confirmation = confirm("Are you sure?\nDo you want to delete this filled template?");
    if (confirmation == true) {
        DeleteFillTemplate(id)
    }
    else {
        return false
    }
    GetPermissions();
}

function GetAccessTokenForBackButton() {
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data: {
            'refresh': localStorage.getItem("Refresh"),
        },
        success: function (result) {
           localStorage.setItem("Token", result.access);
           token = localStorage.getItem("Token")

            setTimeout(function() {
                window.location.href = "/dashboard/";
            }, 500);

        },
        error: function (data) {
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.detail })
        }
    })

}

function getDashboardDatatable() {
    var token = localStorage.getItem("Token");
    $.ajax({
        method : 'GET',
        url : "/dashboard/",
        success: function(data){
            window.location.href = "/dashboard/"
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                GetAccessTokenForBackButton()
            }
        }
    })
}

function getViewFilledTemplate(id) {
    $('#HideDivForView').hide();
    $('#ViewDivTemplate').show();

    url = '/dashboard/fill_template_detail/' + id
    window.localStorage.setItem('editedUserId', id)
    $.ajax({
        url: url,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + userDetails.access },
        dataType: 'text',
        async: false,
        success: function (jsonData) {
            console.log('####################################')
            console.log(jsonData)
            parsed_json = JSON.parse(jsonData)
            console.log(parsed_json)
            console.log(typeof (parsed_json))
            $.each(parsed_json['message'][0], function (key, value) {
                // alert(key)
                // alert(value)
                input = '<input class="validate" id=' + key + ' required="" aria-required="true" value=' + value + '>'
                label = '<label>' + key + '</label>'
                $('#viewFillTemplate').append(input)
                $('#viewFillTemplate').append(label)
                $("#" + key).val(value);
            });
            $('#viewFillTemplate').prop("disabled", true);
            $("input").prop("disabled", true);
        },
        error: function (xhr, status, error) {
            if (xhr.status == 401) {

                getaccessTokenViewUser();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }
    })
    GetPermissions();
}

function getEditFillTemplate(id) {
    $('#HideDivForView').hide();
    $('#EditDivTemplate').show();
    url = '/dashboard/fill_template_detail/' + id
    window.localStorage.setItem('editedUserId', id)
    $.ajax({
        url: url,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + userDetails.access },
        dataType: 'text',
        async: false,
        success: function (jsonData) {
            console.log('***********************************')
            console.log(jsonData)
            parsed_json = JSON.parse(jsonData)
            console.log('***********************************')
            console.log(parsed_json)
            console.log(typeof (parsed_json))
            window.localStorage.setItem('editedTemplateName', parsed_json['message'][2]['templatename'])
            window.localStorage.setItem('editedFileName', parsed_json['message'][1]['filename'])
            var EditTemplateId = []
            $.each(parsed_json['message'][0], function (key, value) {
                // alert(value)
                // alert(key)
                input = '<input class="validate" id=' + key + ' required="" aria-required="true" value=' + value + '>'
                label = '<label>' + key + '</label>'
                $('#editFillTemplate').append(input)
                $('#editFillTemplate').append(label)
                $("#" + key).val(value);
                EditTemplateId.push(key)
                console.log(EditTemplateId)
                localStorage.setItem("EditTemplateId", JSON.stringify(EditTemplateId));
            });

        },
        error: function (xhr, status, error) {
            console.log(xhr)
            console.log(status)
            console.log(error)
            console.log(xhr.status)
            if (xhr.status == 401) {

                getaccessTokenEditUser();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }
    })
    GetPermissions()
}


function EditUserSave(user_name, first_name, last_name,
    middle_name, password, dob, email,
    telephone, address, gender, indian,
    option, role) {
    var edituserid = window.localStorage.getItem('editedUserId')
    option = $("#dropdownid option:selected").val();
    role = $("#role_drop_down option:selected").val();
    var formData = new FormData();
    if ($('#profile_picture_edit').get(0).files.length === 0) {
    }
    else {
        formData.append('profile_picture', $('#profile_picture_edit')[0].files[0]);
    }

    if ($('#resume_edit').get(0).files.length === 0) {
    }
    else {
        formData.append('resume', $('#resume_edit')[0].files[0]);
    }

    if ($('#adhar_card_edit').get(0).files.length === 0) {
    }
    else {
        formData.append('adhar_card', $('#adhar_card_edit')[0].files[0]);
    }

    if ($('#pan_card_edit').get(0).files.length === 0) {
    }
    else {
        formData.append('pan_card', $('#pan_card_edit')[0].files[0]);
    }

    formData.append('user_name', user_name);
    formData.append('first_name', first_name);
    formData.append('middle_name', middle_name);
    formData.append('last_name', last_name);
    formData.append('password', password);
    formData.append('dob', dob);
    formData.append('email', email);
    formData.append('telephone', telephone);
    formData.append('address', address);
    formData.append('gender', gender);
    formData.append('indian', indian);
    formData.append('option', option);
    formData.append('role', role);

    url = '/usermanagement/edituserform/' + edituserid
    $.ajax({
        url: url,
        method: "PUT",
        headers: { Authorization: 'Bearer ' + localStorage.getItem("Token") },
        enctype: 'multipart/form-data',
        data: formData,
        contentType: false,
        processData: false,
        async: false,
        success: function (jsonData) {
            window.location.reload();
            M.toast({ html: jsonData.message, classes: 'green rounded' })
        },
        error: function (xhr, status, error) {
            if (xhr.status == 401) {

                getaccessTokenDatatable();
            }
            parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }
    })
    GetPermissions();
}


function EditUserValidation() {
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

    if (indian) {
        indian = true
    }
    else {
        indian = false
    }
    $('input:radio[name=sex]:nth(1)').attr('checked', true);

    if (user_name == "") {
        M.toast({ html: 'Username must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (first_name == "") {
        M.toast({ html: 'First name must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (middle_name == "") {
        M.toast({ html: 'Middle name must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (last_name == "") {
        M.toast({ html: 'Last name must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (password == "") {
        M.toast({ html: 'Password must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (dob == "") {
        M.toast({ html: 'Date of Birth must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (email == "") {
        M.toast({ html: 'Email address must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (telephone == "") {
        M.toast({ html: 'telephone must be filled out and should be valid number!', classes: 'red rounded' })
        return false;
    }
    else if (isNaN(telephone)) {
        M.toast({ html: 'Telephone should be number!', classes: 'red rounded' })
        return false;
    }
    else if (address == "") {
        M.toast({ html: 'Address must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (gender == "") {
        M.toast({ html: 'Gender must be filled out!', classes: 'red rounded' })
        return false;
    }
    else if (option == "") {
        M.toast({ html: 'Please select your qualification from the dropdown!', classes: 'red rounded' })
        return false;
    }
    else if (role == "") {
        M.toast({ html: 'Please assign an to the user!', classes: 'red rounded' })
        return false;
    }
    else {
        EditUserSave(user_name, first_name, last_name,
            middle_name, password, dob, email,
            telephone, address, gender,
            indian, option, role)
    }
}



function getaccessTokenDashboard() {
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data: {
            'refresh': localStorage.getItem("Refresh"),
        },
        success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            var token = localStorage.getItem("Token");
            window.location.href = "/dashboard/";

        },
        error: function (data) {
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.detail })
        }
    })
}



function getaccessTokenViewUser() {
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data: {
            'refresh': localStorage.getItem("Refresh"),
        },
        success: function (result) {
            localStorage.setItem("Token", result.access);
            var token = localStorage.getItem("Token");
            id = window.localStorage.getItem("editedUserId")
            getViewFilledTemplate(id)
        },
        error: function (data) {
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.detail })
        }
    })
}




function getaccessTokenEditUser() {
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data: {
            'refresh': localStorage.getItem("Refresh"),
        },
        success: function (result) {
            localStorage.setItem("Token", result.access);
            // location.reload();
            var token = localStorage.getItem("Token");
            // window.location.href = "/dashboard/?token="+token;
            id = window.localStorage.getItem("editedUserId")
            getEditFillTemplate(id)
        },
        error: function (data) {
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.detail })
        }
    })
}

function getaccessTokenDeleteUser() {
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data: {
            'refresh': localStorage.getItem("Refresh"),
        },
        success: function (result) {
            localStorage.setItem("Token", result.access);
            var token = localStorage.getItem("Token");
            id = window.localStorage.getItem("editedUserId")
            DeleteFillTemplate(id)
        },
        error: function (data) {
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.detail })
        }
    })
}

function getaccessTokenDatatable() {
    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data: {
            'refresh': localStorage.getItem("Refresh"),
        },
        success: function (result) {
            localStorage.setItem("Token", result.access);
            var token = localStorage.getItem("Token");

            EditUserValidation()
        },
        error: function (data) {
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.detail })
        }
    })
}

function GetTemplateDropdown() {
    // alert('hi')
    // window.location.reload();
    $('#Template-dropdown').show();
    $('#templateDropdownForm').show();
    $('#RenderTemplateDropdown').hide();
    $('#Document-Dashboard-header').hide();
    $('#Template-Dropdown-Header').show();
    $('#Dashboard-Datatable-Div').hide();
    $('#templateDropdownForm').hide();
    $('.dropdown-back-button').show();
    $('.save-cancel-button').hide();
}


function CancelPdfPreview() {
    $('#HideDivForView').show();
    $('#pdf_fill').hide();
    $('#pdf_save_cancel').hide()
    $('.save-cancel-button').show()
    // window.location.reload();
}

function GetSelectedTemplateId() {
    var templateName = $("#Template-dropdown-select option:selected").text();
    // alert(templateName)
    window.localStorage.setItem('selected_template_name', templateName)
    $("#templateDropdownForm").empty();

    var templateId = $("#Template-dropdown-select option:selected").val();
    // alert(templateId)
    // $('#dashboard-template-form').show();
    $.ajax({
        type: 'GET',
        url: "/dashboard/select_template/" + templateId,
        headers: { Authorization: 'Bearer ' + userDetails.access },
        success: function (result) {
            console.log('result')
            console.log(result)
            console.log(result[0])
            localStorage.setItem('fill_filename', result[1].filename)
            var FillId = []
            for (i = 0; i < result[0].placeholder_list.length; i++) {

                if (result[0].placeholder_list[i].includes('image')) {
                    input_type = 'file'
                }
                else {
                    input_type = 'text'
                }
                div_class_start = '<div class="row"><div class="input-field col s12"><i class="material-icons prefix">edit</i>'
                // temp = '<p>'+response[0].placeholder_list[i]+'</p>'
                input = '<input id=' + result[0].placeholder_list[i] + ' type=' + input_type + ' class="validate" required="" aria-required="true">'
                label = '<label for=' + result[0].placeholder_list[i] + '>' + result[0].placeholder_list[i] + '</label>'
                div_class_end = '</div></div>'
                $('#templateDropdownForm').append(div_class_start)
                $('#templateDropdownForm').append(input)
                $('#templateDropdownForm').append(label)
                $('#templateDropdownForm').append(div_class_end)
                FillId.push(result[0].placeholder_list[i])
                $('#templateDropdownForm').show();
                $('.dropdown-back-button').hide();
                $('.save-cancel-button').show();

            }
            console.log(FillId)
            localStorage.setItem("FillId", JSON.stringify(FillId));
        },
        error: function (data) {
            obj = JSON.parse(data.responseText)
            M.toast({ html: obj.detail })
        }
    })

}

function GotoDashboard() {
    window.location.reload();
}


function SaveFilledForm(event) {
    // alert(event)
    // $('#UploadTemplate').prop('disabled', true);
    var filename = localStorage.getItem('fill_filename')
    var fd = new FormData();
    var retrievedData = localStorage.getItem("FillId");
    var id = JSON.parse(retrievedData);
    var selected_template_name_retrieve = window.localStorage.getItem('selected_template_name')
    $.each(id, function (i, l) {
        console.log(l)
        var id_name = $($.trim('#') + $.trim(l)).val()
        fd.append(l, id_name)

    })

    fd.append('filename', filename)
    fd.append('templatename', selected_template_name_retrieve)
    fd.append('save', event)

    console.log(fd)
    $.ajax({
        url: '/dashboard/fill_dropdown_template/',
        headers: { Authorization: 'Bearer ' + userDetails.access },
        method: "POST",
        enctype: 'multipart/form-data',
        data: fd,
        contentType: false,
        processData: false,
        async: false,
        success: function (response) {
            $('#pdf_save_cancel').empty();
            if (response.status == 201) {
                M.toast({ html: 'Template is saved successfully', classes: 'green rounded' })
                $('#HideDivForView').show();
                $('#pdf_fill').hide();
                $('#pdf_save_cancel').hide()
                $('.save-cancel-button').show()
                $('#Template-dropdown').show();
                $('#templateDropdownForm').show();
                $('#RenderTemplateDropdown').hide();
                $('#Document-Dashboard-header').hide();
                $('#Template-Dropdown-Header').show();
                $('#Dashboard-Datatable-Div').hide();
                $('#templateDropdownForm').hide();
                $('.dropdown-back-button').show();
                $('.save-cancel-button').hide();


            }
            else {
                M.toast({ html: 'Template is successfully filled', classes: 'green rounded' })

                $('#templateForm *').attr("disabled", true);
                $('#templateForm *').fadeTo('slow', .8);

                setTimeout(function () {
                    var object = document.getElementById('pdf_preview_fill');
                    // alert(response['success'])
                    object.setAttribute('data', response['success']);

                    var clone = object.cloneNode(true);
                    var parent = object.parentNode;

                    parent.removeChild(object);
                    parent.appendChild(clone);
                }, 3000);

                // $("#pdf_preview").setAttribute("data", response['success']) 

                $('#pdf_fill').show();
                $('#pdf_save_cancel').show();
                $('.preview_pdf_div').hide();
                $('.save-cancel-button').hide();
                submit_button = `<div class="row">\
                            <div class="col push-s3">\
                                <button id="file_cancel_btn" class="btn btn-primary" type="reset" onclick="CancelPdfPreview()">Cancel<i class="material-icons right">cancel</i>\
                                </button>\
                                <button id="file_save_btn" class="btn btn-primary" type="submit" onclick="SaveFilledForm(true)">Save<i class="material-icons right">save</i>\
                                </button>\
                            </div>\
                        </div>`
                $('#pdf_save_cancel').append(submit_button);
                $('#pdf_save_cancel').show();
                // window.location.reload();
                return false

            }
        },
        error: function (xhr) {
            if (xhr.status == 401) {

                getaccessToken(SaveFields)
            }

            parsed_jsondata = JSON.parse(xhr.responseText)
            // alert(parsed_jsondata.error)
            M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
            setTimeout(function () {
                $('#field_save_btn').prop('disabled', true)
            }, 2000);

            return false
        }

    });

}

function SaveFillTemplate() {
    var retrievedData = localStorage.getItem("FillId");
    var FillId = JSON.parse(retrievedData);
    $('#HideDivForView').hide();
    console.log('******************')
    console.log(retrievedData)
    values = []
    // alert(FillId.length)
    var all_validated = true

    $.each(FillId, function (i, l) {
        // alert(i)
        console.log(l)
        var id_name = $($.trim('#') + $.trim(l)).val()
        console.log(id_name)
        if (id_name == "") {
            M.toast({ html: "Please fill the " + l + "field", classes: 'red rounded' })
            // $('#field_save_btn').prop('disabled', false)
            all_validated = false
            // return false;
        }



    });
    if (all_validated == true) {
        SaveFilledForm(false);
    }
    else {
        $('#HideDivForView').show();
        return false
    }
    // alert('hi')

}

function GotoDashboard() {
    window.location.reload();
}

function CancelPdfPreviewEdit() {
    // alert('hi')
    $('#pdf_edit').hide();
    $('#EditDivTemplate').show();
    $('#pdf_save_cancel_edit').hide();
}

function SaveEditedTemplateValidate(event) {
    var fd = new FormData();
    edittemplateid = window.localStorage.getItem('editedUserId')
    retrievedEditTemplateId = window.localStorage.getItem('EditTemplateId')
    retrievedEditTemplateName = window.localStorage.getItem('editedTemplateName')
    retrievedEditFilename = window.localStorage.getItem('editedFileName')
    parsedEditTemplateId = JSON.parse(retrievedEditTemplateId)
    for (i = 0; i < parsedEditTemplateId.length; i++) {
        var str = $('#' + parsedEditTemplateId[i]).val();
        fd.append(parsedEditTemplateId[i], str)
    }
    fd.append('filename', retrievedEditFilename)
    fd.append('templatename', retrievedEditTemplateName)
    fd.append('save', event)
    console.log(fd)
    $.ajax({
        url: '/dashboard/fill_template_detail/' + edittemplateid,
        headers: { Authorization: 'Bearer ' + userDetails.access },
        method: "PUT",
        enctype: 'multipart/form-data',
        data: fd,
        contentType: false,
        processData: false,
        async: false,
        success: function (response) {
            $("#pdf_save_cancel_edit").empty();
            if (response.status == 201) {
                M.toast({ html: 'Template Edited successfully', classes: 'green rounded' })

                setTimeout(function () {
                    window.location.reload();
                }, 3000);
            }
            else {
                M.toast({ html: 'Template is successfully filled', classes: 'green rounded' })

                $('#templateForm *').attr("disabled", true);
                $('#templateForm *').fadeTo('slow', .8);

                setTimeout(function () {
                    var object = document.getElementById('pdf_preview_edit');
                    // alert(response['success'])
                    object.setAttribute('data', response['success']);

                    var clone = object.cloneNode(true);
                    var parent = object.parentNode;

                    parent.removeChild(object);
                    parent.appendChild(clone);
                }, 3000);

                // $("#pdf_preview").setAttribute("data", response['success']) 

                $('#pdf_edit').show();
                $('#EditDivTemplate').hide();
                // window.location.reload();
                submit_button = `<div class="row">\
                            <div class="col push-s3">\
                                <button id="file_cancel_btn" class="btn btn-primary" type="reset" onclick="CancelPdfPreviewEdit()">Cancel<i class="material-icons right">cancel</i>\
                                </button>\
                                <button id="file_save_btn" class="btn btn-primary" type="submit" onclick="SaveEditedTemplateValidate(true)">Save<i class="material-icons right">save</i>\
                                </button>\
                            </div>\
                        </div>`
                $('#pdf_save_cancel_edit').append(submit_button);
                $('#pdf_save_cancel_edit').show();
                return false

            }
        },
        error: function (xhr) {
            if (xhr.status == 401) {

                getaccessToken(SaveFields)
            }

            parsed_jsondata = JSON.parse(xhr.responseText)
            // alert(parsed_jsondata.error)
            M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
            setTimeout(function () {
                $('#field_save_btn').prop('disabled', true)
            }, 2000);

            return false
        }

    });

}

function SaveEditedTemplate() {
    retrievedEditTemplateId = window.localStorage.getItem('EditTemplateId')
    parsedEditTemplateId = JSON.parse(retrievedEditTemplateId)
    var all_validated = true
    for (i = 0; i < parsedEditTemplateId.length; i++) {
        var str = $('#' + parsedEditTemplateId[i]).val();
        if (str == '') {
            M.toast({ html: "Please fill the " + parsedEditTemplateId[i] + "field", classes: 'red rounded' })
            all_validated = false
            return false
        }
    }
    if (all_validated == true) {
        SaveEditedTemplateValidate(false)
    }
}