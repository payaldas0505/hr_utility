$(document).ready(function () {
    $(".user_management").hide();
    $(".template_management").hide();
    $('#Template-dropdown').hide();
    $('#templateDropdownForm').hide();
    $('#Template-Dropdown-Header').hide();
    $('#template_container').hide();
    $('.dropdown-back-button').hide();
    $('.save-cancel-button').hide();
    $('#ViewDivTemplate').hide();
    $('#EditDivTemplate').hide();
    $('#pdf_fill').hide();
    $('#pdf_edit').hide();
    $('#pdf_save_cancel').hide();
    $('select').formSelect();
    $('#RenderTemplateDropdown').hide();
   

    if (localStorage.getItem("UserPermissions") === null) {
        GetPermissions()
    }
    else {
        SetPermissionsUserDashboard()
    }
    get_labels('main_dashboard_page')

})


function DocumentTemplateDropdown() {
    $.ajax({
        url: '/dashboard/document_template_dropdown/',
        headers: { Authorization: 'Bearer ' + userDetails.access },
        type: 'GET',

        success: function (response) {
            for (let i = 0; i < response.message.length; i++) {
                let temp = '<option value=' + response.message[i].id + '>' + response.message[i].word_name + '</option>'
                $('#Template-dropdown-select').append(temp)
                $('select').formSelect();
            }
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                getaccessToken(DocumentTemplateDropdown);
            }
            if (xhr.status == 403) {
                logout()
            }
            let parsed_json = JSON.parse(xhr.responseText)
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
            SetPermissionsUserDashboard();
        },
        error: function (xhr) {
            let parsed_json = JSON.parse(xhr.responseText)
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
        if (userPermissions.includes('select_template_get')){
            $('#RenderTemplateDropdown').show();
        }
    }
}

var userDetails = getValues('UserDetails')
var user_role_id = userDetails.role_id

function DownloadFillTemplate(id) {
    window.open('/media/filled_user_template/' + id + '.pdf', '_blank')
    // window.location.href = '/media/filled_user_template/' + id + '.pdf'
}

function DeleteFillTemplate(id) {
    let url = '/dashboard/fill_template_detail/' + id

    $.ajax({
        url: url,
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + userDetails.access },
        dataType: 'text',
        async: false,
        success: function (jsonData) {
            // let token = localStorage.getItem("Token");
            let parsed_jsondata = JSON.parse(jsonData)
            M.toast({ html: parsed_jsondata.message, classes: 'green rounded' })
            setTimeout(function () {
                window.location.reload();
            }, 2000);
        },
        error: function (xhr, status, error) {
            if (xhr.status == 401) {
                getaccessTokenUserDashboard(DeleteFillTemplate);
            }
            let parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }
    })
}

function getDeleteFillTemplate(id) {
    var confirmation = confirm("Are you sure?\nDo you want to delete this filled template?");
    if (confirmation == true) {
        window.localStorage.setItem('editedUserId', id)
        DeleteFillTemplate(id)
    }
    else {
        return false
    }
}

function getViewFilledTemplate(id) {
    $('#HideDivForView').hide();
    $('#ViewDivTemplate').show();

    let url = '/dashboard/fill_template_detail/' + id
    window.localStorage.setItem('editedUserId', id)
    $.ajax({
        url: url,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + userDetails.access },
        dataType: 'text',
        async: false,
        success: function (jsonData) {
            let parsed_json = JSON.parse(jsonData)
            $.each(parsed_json['message'][0], function (key, value) {
                let input = '<input class="validate" id=' + key + ' required="" aria-required="true" value=' + value + '>'
                let label = '<label>' + key + '</label>'
                $('#viewFillTemplate').append(input)
                $('#viewFillTemplate').append(label)
                $("#" + key).val(value);
            });
            $('#viewFillTemplate').prop("disabled", true);
            $("input").prop("disabled", true);
        },
        error: function (xhr, status, error) {
            if (xhr.status == 401) {
                getaccessTokenUserDashboard(getViewFilledTemplate);
            }
            let parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }
    })
}

function getEditFillTemplate(id) {
    $('#HideDivForView').hide();
    $('#EditDivTemplate').show();
    let url = '/dashboard/fill_template_detail/' + id
    window.localStorage.setItem('editedUserId', id)
    $.ajax({
        url: url,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + userDetails.access },
        dataType: 'text',
        async: false,
        success: function (jsonData) {
            let parsed_json = JSON.parse(jsonData)
            window.localStorage.setItem('editedTemplateName', parsed_json['message'][2]['templatename'])
            window.localStorage.setItem('editedFileName', parsed_json['message'][1]['filename'])
            var EditTemplateId = []
            $.each(parsed_json['message'][0], function (key, value) {
                let input = '<input class="validate" id=' + key + ' required="" aria-required="true" value=' + value + '>'
                let label = '<label>' + key + '</label>'
                $('#editFillTemplate').append(input)
                $('#editFillTemplate').append(label)
                $("#" + key).val(value);
                EditTemplateId.push(key)
                localStorage.setItem("EditTemplateId", JSON.stringify(EditTemplateId));
            });
        },
        error: function (xhr, status, error) {
            if (xhr.status == 401) {
                getaccessTokenUserDashboard(getEditFillTemplate);
            }
            let parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.message, classes: 'red rounded' })
            return false
        }
    })
}


function GetTemplateDropdown() {
    DocumentTemplateDropdown()
    $('#Template-dropdown').show();
    $('#templateDropdownForm').show();
    $('#RenderTemplateDropdown').hide();
    $('#Document-Dashboard-header').hide();
    $('#Template-Dropdown-Header').show();
    $('#template_container').show();
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
}

function GetSelectedTemplateId() {
    var templateName = $("#Template-dropdown-select option:selected").text();
    window.localStorage.setItem('selected_template_name', templateName)
    $("#templateDropdownForm").empty();
    var templateId = $("#Template-dropdown-select option:selected").val();
    $.ajax({
        type: 'GET',
        url: "/dashboard/select_template/" + templateId,
        headers: { Authorization: 'Bearer ' + userDetails.access },
        success: function (result) {
            console.log(result)
            localStorage.setItem('fill_filename', result[1].filename)
            var FillId = []
            FillId.push('Document_Name')
            $('#templateDropdownForm').append('<h6><strong>Give document a name of your choice.</strong></h6>')
            let div_class_start = '<div class="row"><div class="input-field col s6 offset-s3">'
            let input = '<i class="material-icons left">edit</i><input id="Document_Name" type=text class="validate" required="" aria-required="true">'
            let label = '<label for="Document_Name">Document Name</label>'
            let div_class_end = '</div></div>'
            $('#templateDropdownForm').append(div_class_start)
            $('#templateDropdownForm').append(input)
            $('#templateDropdownForm').append(label)
            $('#templateDropdownForm').append(div_class_end)

            $('#templateDropdownForm').append('<h6 style="margin-top=10px"><strong>Replace the dummy values with the values you want.</strong></h6>')
            for (let i = 0; i < result[0].placeholder_list.length; i++) {
                if (result[0].placeholder_list[i].includes('image')) {
                    var input_type = 'file'
                }
                else {
                    input_type = 'text'
                }
                div_class_start = '<div class="row"><div class="input-field col s6 offset-s3">'
                input = '<i class="material-icons left">edit</i><input id=' + result[0].placeholder_list[i] + ' type=' + input_type + ' class="validate" required="" aria-required="true" value='+result[2].dummy_values[i]+'><label for=' + result[0].placeholder_list[i] + '>' + result[0].placeholder_list[i] + '</label>'
                div_class_end = '</div></div>'
                $('#templateDropdownForm').append(div_class_start)
                $('#templateDropdownForm').append(input)
                // $('#templateDropdownForm').append(label)
                $('#templateDropdownForm').append(div_class_end)
                FillId.push(result[0].placeholder_list[i])
                $('#templateDropdownForm').show();
                $('.dropdown-back-button').show();
                $('.save-cancel-button').show();
                $("#" + result[0].placeholder_list[i]).val(result[2].dummy_values[i]);

            }
            

            localStorage.setItem("FillId", JSON.stringify(FillId));
        },
        error: function (data) {
            if (xhr.status == 401) {
                getaccessToken(GetSelectedTemplateId);
            }
            let obj = JSON.parse(data.responseText)
            M.toast({ html: obj.detail })
        }
    })
}

function GotoDashboard() {
    window.location.reload();
}

function SaveFilledForm(event) {
    window.localStorage.setItem('fill_form_event', event)
    var filename = localStorage.getItem('fill_filename')
    var fd = new FormData();
    var retrievedData = localStorage.getItem("FillId");
    var id = JSON.parse(retrievedData);
    var selected_template_name_retrieve = window.localStorage.getItem('selected_template_name')
    $.each(id, function (i, l) {
        var id_name = $($.trim('#') + $.trim(l)).val()
        fd.append(l, id_name)
    })

    fd.append('filename', filename)
    fd.append('templatename', selected_template_name_retrieve)
    fd.append('save', event)

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

                setTimeout(function () {
                    window.location.reload();
                }, 3000);
            }
            else {
                M.toast({ html: 'Template is successfully filled', classes: 'green rounded' })

                $('#templateForm *').attr("disabled", true);
                $('#templateForm *').fadeTo('slow', .8);

                setTimeout(function () {
                    var object = document.getElementById('pdf_preview_fill');
                    object.setAttribute('data', response['success']);

                    var clone = object.cloneNode(true);
                    var parent = object.parentNode;

                    parent.removeChild(object);
                    parent.appendChild(clone);
                }, 3000);

                $('#pdf_fill').show();
                $('#pdf_save_cancel').show();
                $('.preview_pdf_div').hide();
                $('.save-cancel-button').hide();
                let submit_button = `<div class="row">\
                            <div class="col push-s3">\
                                <button id="file_cancel_btn" class="btn btn-primary" type="reset" onclick="CancelPdfPreview()">Cancel<i class="material-icons right">cancel</i>\
                                </button>\
                                <button id="file_save_btn" class="btn btn-primary" type="submit" onclick="SaveFilledForm(true)">Save<i class="material-icons right">save</i>\
                                </button>\
                            </div>\
                        </div>`
                $('#pdf_save_cancel').append(submit_button);
                $('#pdf_save_cancel').show();
                return false
            }
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                getaccessTokenFormEvent(SaveFilledForm)
            }
            let parsed_jsondata = JSON.parse(xhr.responseText)
            $('#HideDivForView').show();
            $('#Document_Name').addClass("invalid");
            M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
            setTimeout(function () {
                $('#field_save_btn').prop('disabled', false)
            }, 2000);
            return false
        }
    });
}

function SaveFillTemplate() {
    var retrievedData = localStorage.getItem("FillId");
    var FillId = JSON.parse(retrievedData);
    $('#HideDivForView').hide();
    var all_validated = true

    $.each(FillId, function (i, l) {
        var id_name = $($.trim('#') + $.trim(l)).val()
        if (id_name == "") {
            M.toast({ html: "Please fill the " + l + "field", classes: 'red rounded' })
            all_validated = false
        }
    });
    if (all_validated == true) {
        SaveFilledForm(false);
    }
    else {
        $('#HideDivForView').show();
        return false
    }
}

function GotoDashboard() {
    window.location.reload();
}

function CancelPdfPreviewEdit() {
    $('#pdf_edit').hide();
    $('#EditDivTemplate').show();
    $('#pdf_save_cancel_edit').hide();
}

function SaveEditedTemplateValidate(event) {
    window.localStorage.setItem('fill_form_event', event)
    var fd = new FormData();
    let edittemplateid = window.localStorage.getItem('editedUserId')
    let retrievedEditTemplateId = window.localStorage.getItem('EditTemplateId')
    let retrievedEditTemplateName = window.localStorage.getItem('editedTemplateName')
    let retrievedEditFilename = window.localStorage.getItem('editedFileName')
    let parsedEditTemplateId = JSON.parse(retrievedEditTemplateId)
    for (let i = 0; i < parsedEditTemplateId.length; i++) {
        var str = $('#' + parsedEditTemplateId[i]).val();
        fd.append(parsedEditTemplateId[i], str)
    }
    fd.append('filename', retrievedEditFilename)
    fd.append('templatename', retrievedEditTemplateName)
    fd.append('save', event)

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
                    object.setAttribute('data', response['success']);

                    var clone = object.cloneNode(true);
                    var parent = object.parentNode;

                    parent.removeChild(object);
                    parent.appendChild(clone);
                }, 3000);

                $('#pdf_edit').show();
                $('#EditDivTemplate').hide();
                let submit_button = `<div class="row">\
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
                getaccessTokenFormEvent(SaveEditedTemplateValidate)
            }
            let parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
            setTimeout(function () {
                $('#field_save_btn').prop('disabled', true)
            }, 2000);
            return false
        }
    });
}

function SaveEditedTemplate() {
    let retrievedEditTemplateId = window.localStorage.getItem('EditTemplateId')
    let parsedEditTemplateId = JSON.parse(retrievedEditTemplateId)
    let all_validated = true
    for (let i = 0; i < parsedEditTemplateId.length; i++) {
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
