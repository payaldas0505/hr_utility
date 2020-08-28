$(document).ready(function () {
    $('#word_name').focus()
    get_labels('add_template_page')
    let keysToRemove = ["Id", "filename"];

    localStorageRemoveKey(keysToRemove);

    $('#pdf').hide();
    $('#save').hide();
    // getUserRoleDropDown();

    // Word name avaliable in database
    $('#word_name').on('blur', function () {
        var word_name = $('#word_name').val();
        var get_url = '/dashboard/template_management/add_template/';
        if (word_name == '') {
            var word_name_state = false;
            return;
        }
        $.ajax({
            url: 'check_word_name/',
            headers: { Authorization: 'Bearer ' + access },
            type: 'post',
            data: {
                'word_name_check': 1,
                'word_name': word_name,
            },
            success: function (response) {

                if (response.message == 'taken') {
                    word_name_state = false;
                    $('#word_name').addClass("invalid");
                    M.toast({ html: response.toast_msg, classes: 'red rounded' })
                }
                else if (response.message == 'not_taken') {
                    word_name_state = true;
                    $('#word_name').addClass("valid");
                    M.toast({ html: response.toast_msg, classes: 'green darken-1 rounded' })
                }
            },
            error: function (xhr) {
                if (xhr.status == 401) {
                    getaccessTokenForUrl(get_url);
                }
                let parsed_jsondata = JSON.parse(xhr.responseText)
                // alert(parsed_jsondata.error)
                M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
            }
        });
    });
})
var userDetails = getValues('UserDetails')
var access = userDetails.access

function SubmitUploadWordTemplate() {
    $('#UploadTemplate').prop('disabled', true);
    var fd = new FormData();
    var files = $('#word_template')[0].files[0];
    var word_name = $('#word_name').val()
    fd.append('word_template', files);
    fd.append('word_name', word_name);

    $.ajax({
        url: '/dashboard/template_management/add_template_data/',
        headers: { Authorization: 'Bearer ' + access },
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        success: function (response) {
            $('#uploadTemplateDiv *').attr("disabled", true);
            $('#uploadTemplateDiv *').fadeTo('slow', .8);
            localStorage.setItem('filename', response[1].filename)
            var id = []
            for (let i = 0; i < response[0].placeholder_list.length; i++) {
                console.log(response[0].placeholder_list[i])
                console.log(response[0].placeholder_list[i].length)
                if (response[0].placeholder_list[i].includes('image')) {
                    var input_type = 'file'
                } else {
                    input_type = 'text'
                }
                let div_class_start = '<div class="row"><div class="input-field col s12"><i class="material-icons prefix">edit</i>'
                let input = '<input id=' + response[0].placeholder_list[i] + ' type=' + input_type + ' class="validate" required="" aria-required="true">'
                let label = '<label for=' + response[0].placeholder_list[i] + '>' + response[0].placeholder_list[i] + '</label>'
                let div_class_end = '</div></div>'
                $('#templateFormAppend').append(div_class_start)
                $('#templateFormAppend').append(input)
                $('#templateFormAppend').append(label)
                $('#templateFormAppend').append(div_class_end)
                id.push(response[0].placeholder_list[i])
            }
            let submit_button = '<div class="row"><div class="col push-s3"><button id="field_save_btn" class="btn btn-primary" type="submit" onclick="FieldUploadWordTemplate(event)">Upload<i class="material-icons right">send</i></button></div></div>'
            $('#templateFormAppend').append(submit_button)
            $('#templateForm').show();
            localStorage.setItem("Id", JSON.stringify(id));
        },
        error: function (xhr) {
            if (xhr.status == 401) {

                getaccessToken(SubmitUploadWordTemplate);
            }
            if (xhr.status == 403) {
                logout()
            }
            let parsed_jsondata = JSON.parse(xhr.responseText)
            M.toast({ html: parsed_jsondata.error, classes: 'red rounded' })
            setTimeout(function () {
                $("#submit_form").attr("disabled", false);
            }, 2000);
            return false
        }

    });
}

function Submit_word_template(){
    $("#submit_form").attr("disabled", true);
    var word_name = $('#word_name').val();

    if (word_name == "") {

        $("#submit_form").attr("disabled", false);
        M.toast({ html: 'Please enter the name for the document!', classes: 'red rounded' })
        return false;
    } else if ($('#word_template').get(0).files.length === 0) {
        $("#submit_form").attr("disabled", false);
        M.toast({ html: 'Please upload file!', classes: 'red rounded' })
        return false;
    } else {
        SubmitUploadWordTemplate()
    }
}
// Validation of fields

// $('#word_template').change(function () {
//     let keysToRemove = ["Id", "filename"];
//     localStorageRemoveKey(keysToRemove);
//     $("#templateFormAppend").empty();

//     $("#UploadTemplate").attr("disabled", true);

//     var word_name = $('#word_name').val();

//     if (word_name == "") {

//         $("#UploadTemplate").attr("disabled", false);
//         M.toast({ html: 'Please enter the name for the document!', classes: 'red rounded' })
//         return false;
//     } else if ($('#word_template').get(0).files.length === 0) {
//         $("#UploadTemplate").attr("disabled", false);
//         M.toast({ html: 'Please upload file!', classes: 'red rounded' })
//         return false;
//     } else {
//         SubmitUploadWordTemplate()
//     }
// })


function getTemplateDashboard() {
    var get_url = "/dashboard/template_management/"
    $.ajax({
        method: 'GET',
        url: get_url,
        success: function (data) {
            window.location.href = get_url
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                getaccessTokenForUrl(get_url)
            }
            if (xhr.status == 403) {
                logout()
            }
        }
    })
}



function SaveFields(save = false) {



    $('#UploadTemplate').prop('disabled', true);
    var filename = localStorage.getItem('filename')
    var fd = new FormData();
    var retrievedData = localStorage.getItem("Id");
    var id = JSON.parse(retrievedData);
    var doc_name = $('#word_name').val()


    $.each(id, function (i, l) {
        console.log(l)
        var id_name = $($.trim('#') + $.trim(l)).val()
        fd.append(l, id_name)

    })

    fd.append('filename', filename)
    fd.append('document', doc_name)
    fd.append('save', save)

    console.log(fd)
    $.ajax({
        url: 'fill/',
        headers: { Authorization: 'Bearer ' + access },
        method: "POST",
        enctype: 'multipart/form-data',
        data: fd,
        contentType: false,
        processData: false,
        async: false,
        success: function (response) {
            if (response.status == 201) {
                getTemplateDashboard();
            } else {
                M.toast({ html: 'Template is successfully filled', classes: 'green rounded' })

                $('#templateForm *').attr("disabled", true);
                $('#templateForm *').fadeTo('slow', .8);

                setTimeout(function () {
                    var object = document.getElementById('pdf_preview');
                    object.setAttribute('data', response['success']);

                    var clone = object.cloneNode(true);
                    var parent = object.parentNode;

                    parent.removeChild(object);
                    parent.appendChild(clone);
                }, 3000);


                $('#pdf').show();
                return false
            }

        },
        error: function (xhr) {
            if (xhr.status == 401) {

                getaccessToken(SaveFields)
            }
            if (xhr.status == 403) {
                logout()
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


function FieldUploadWordTemplate(event) {
    // retrieving our data and converting it back into an array
    $('#field_save_btn').prop('disabled', true)
    event.preventDefault();
    var retrievedData = localStorage.getItem("Id");
    var id = JSON.parse(retrievedData);
    var all_validated = true

    // values = []
    $.each(id, function (i, l) {

        var id_name = $($.trim('#') + $.trim(l)).val()
        console.log(id_name)
        if (id_name == "") {
            M.toast({ html: "Please fill the " + l + "field", classes: 'red rounded' })
            $('#field_save_btn').prop('disabled', false)
            all_validated = false
            return false;
        }

    });

    if (all_validated == true) {
        SaveFields();
        let submit_button = `<div class="row">\
                            <div class="col push-s3">\
                                <button id="file_cancel_btn" class="btn btn-primary" type="reset" onclick="Cancel(event)">Cancel<i class="material-icons right">cancel</i>\
                                </button>\
                                <button id="file_save_btn" class="btn btn-primary" type="submit" onclick="SavePdfFile(event)">Save<i class="material-icons right">save</i>\
                                </button>\
                            </div>\
                        </div>`
        $('#save').append(submit_button);
        $('#save').show();
    }


}


function SavePdfFile(event) {
    event.preventDefault();
    let save
    SaveFields(save = true);
}

function Cancel(event) {
    getTemplateDashboard();
}


function localStorageRemoveKey(keysToRemove) {
    for (let key of keysToRemove) {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }

    }
}
