var tableLoad = $(document).ready(function() {
    var userDetails = getValues('UserDetails')
    var access = userDetails.access
    $('#dashboardRegisterForm').hide();
    $('#dropdownid').not('.disabled').formSelect();

    // if (localStorage.getItem("Supseruser") === "true") {
    //     localStorage.removeItem("Superuser");
    // }
    $('#user_datatable').removeAttr('width').DataTable({
        dom: 'frtlip',
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "get_all_user",
            "type": "GET",
            "headers": { Authorization: 'Bearer ' + access },
            "error": function(data) {
                if (data.status == 401) {
                    let get_url = "/dashboard/user_management/"
                    getaccessTokenForUrl(get_url);

                } else {
                    M.toast({ html: JSON.parse(data.responseText).message, classes: 'red rounded' })
                }
            }
        },
        "columns": [{
                "data": null,
                render: function(data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },

            { "data": "user_name" },
            { "data": "email" },
            {
                "data": 'user_status',
                "render": function(data) {
                    if (data) {
                        return '<i class="material-icons  green-text">check_circle</i>'
                    } else {
                        return '<i class="material-icons red-text">cancel</i>'
                    }
                }
            },
            {
                "data": "user_id",
                "render": function(data) {
                    var all_perms = '<button class="edit_btn" id=' + data + ' onclick=getEditReport(id)><i class="material-icons prefix">mode_edit</i></button> <button class="delete_btn" id=' + data + ' onclick=getDeleteReport(id)><i class="material-icons prefix">delete</i></button> <button class="view_btn" id=' + data + ' onclick=getViewReport(id)><i class="material-icons prefix">visibility</i></button>'
                    var edit_view = '<button class="edit_btn" id=' + data + ' onclick=getEditReport(id)><i class="material-icons prefix">mode_edit</i></button> <button class="view_btn" id=' + data + ' onclick=getViewReport(id)><i class="material-icons prefix">visibility</i></button>'
                    var only_view = '<button class="view_btn" id=' + data + ' onclick=getViewReport(id)><i class="material-icons prefix">visibility</i></button>'

                    var retrievedData = localStorage.getItem("UserPermissions");
                    var userPermissions = JSON.parse(retrievedData);

                    if (!jQuery.isEmptyObject(userPermissions)) {

                        var delete_user_flag = userPermissions.includes('delete_user_delete')
                        var edit_user_flag = userPermissions.includes('edit_user_get')
                        var view_user_flag = userPermissions.includes('view_user_get')

                        if (delete_user_flag == true && edit_user_flag == true && view_user_flag == true) {
                            return all_perms
                        } else if (delete_user_flag == false && edit_user_flag == true && view_user_flag == true) {
                            return edit_view
                        } else if (delete_user_flag == false && edit_user_flag == false && view_user_flag == true) {
                            return only_view
                        }

                    } else {
                        return 'no action'
                    }
                }
            },

        ],
        "columnDefs": [
            { "className": "dt-center", "targets": "_all" }
        ],
    });
    //lengthmenu -> add a margin to the right and reset clear
    $(".dataTables_length").css('clear', 'none');
    $(".dataTables_length").css('margin-right', '20px');

    //info -> reset clear and padding
    $(".dataTables_info").css('clear', 'none');
    $(".dataTables_info").css('padding', '0');
    // Call datatables, and return the API to the variable for use in our code
    // Binds datatables to all elements with a class of datatable
    var table = $("#user_datatable").dataTable().api();
    // Grab the datatables input box and alter how it is bound to events
    $(".dataTables_filter input")
        .unbind() // Unbind previous default bindings
        .bind("input", function(e) { // Bind our desired behavior
            // If the length is 3 or more characters, or the user pressed ENTER, search
            if (this.value.length >= 3 || e.keyCode == 13) {
                // Call the API search function
                table.search(this.value).draw();
            }
            // Ensure we clear the search if they backspace far enough
            if (this.value == "") {
                table.search("").draw();
            }
            return;
        });


});

$.fn.dataTable.ext.errMode = function(settings, helpPage, message) {
    console.log(message);
    M.toast({ html: message, classes: 'red rounded' })
};
