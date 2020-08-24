var tableLoad = $(document).ready(function() {
    $('#dashboardRegisterForm').hide();
    $('#dropdownid').not('.disabled').formSelect();

    if (localStorage.getItem("Supseruser") === "true") {
        localStorage.removeItem("Superuser");
    }
    $('#Dashboard-Datatable').removeAttr('width').DataTable({
        dom: 'frtlip',
        "autoWidth": false,
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/dashboard/getallfilltemplate",
            "type": "GET",
            "headers": { Authorization: 'Bearer ' + userDetails.access },
            "error" : function(data){
                if (data.status == 401) {
                    getaccessTokenDatatable();
                }
                else{
                    M.toast({html:JSON.parse(data.responseText).message, classes: 'red rounded'})
                }
            }
        },

        "columns" : [
                        {"data" : null,
                        render: function (data, type, row, meta) {
                            return meta.row + meta.settings._iDisplayStart + 1;
                        }},
                        {"data" : "employee_name"},
                        {"data" : "template_name"},
                        {"data" : 'docx_name',
                        "render" : function (data, type, row, meta) {
                            return '<button id='+data+' onclick=DownloadFillTemplate(id)><i class="material-icons prefix">file_download</i></button>'
                        }},
                        {"data" : "id",
                        "render" : function(data){
                            var all_perms = '<button class="edit_btn" id='+data+' onclick=getEditFillTemplate(id)><i class="material-icons prefix">mode_edit</i></button> <button class="delete_btn" id='+data+' onclick=getDeleteFillTemplate(id)><i class="material-icons prefix">delete</i></button> <button class="view_btn" id='+data+' onclick=getViewFilledTemplate(id)><i class="material-icons prefix">visibility</i></button>'
                            return all_perms
                        }},

            ],
            columnDefs: [
                {
                    targets: ['_all'],
                    className: 'mdc-data-table__cell'
                }
            ]
    });
    $(".dataTables_length").css('clear', 'none');
    $(".dataTables_length").css('margin-right', '20px');

    $(".dataTables_info").css('clear', 'none');
    $(".dataTables_info").css('padding', '0');
    // Call datatables, and return the API to the variable for use in our code
    // Binds datatables to all elements with a class of datatable
    var table = $("#Dashboard-Datatable").dataTable().api();

    // Grab the datatables input box and alter how it is bound to events
    $(".dataTables_filter input")
        .unbind() // Unbind previous default bindings
        .bind("input", function(e) { // Bind our desired behavior
            // If the length is 3 or more characters, or the user pressed ENTER, search
            if(this.value.length >= 3 || e.keyCode == 13) {
                // Call the API search function
                table.search(this.value).draw();
            }
            // Ensure we clear the search if they backspace far enough
            if(this.value == "") {
                table.search("").draw();
            }
            return;
    });


} );

$.fn.dataTable.ext.errMode = function ( settings, helpPage, message ) {
    console.log(message);
    M.toast({html: message, classes: 'red rounded'})
};



function getaccessTokenDatatable(){
    $.ajax({
         type: 'POST',
         url: '/v2s/refresh_token/',
         data : {
           'refresh' : localStorage.getItem("Refresh"),
         },
         success: function (result) {
            localStorage.setItem("Token", result.access);
            var token = localStorage.getItem("Token");
            setTimeout(function() {
                window.location.href = "/v2s/dashboard/";
            }, 200);
         },
         error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
         }
   })
 }
