var tableLoad = $(document).ready(function() {
    // GetPermissions()
    var userDetails = getValues('UserDetails')
    var access = userDetails.access

    if (localStorage.getItem("Supseruser") === "true") {
        localStorage.removeItem("Superuser");
    }
    $('#template_datatable').removeAttr('width').DataTable({
        dom: 'frtlip',
        "autoWidth": false,
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "get_all_templates",
            "type": "GET",
            "headers": { Authorization: 'Bearer '+ access},
            "error" : function(data){
                if (data.status == 401) {
                    let get_url = "/dashboard/user_management/?token="
                    getaccessTokenForUrl(get_url);

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
                        {"data" : "pdf_name"},
                        {'data' : 'pdf',
                        "render" : function (data, type, row, meta) {
                          return '<button id='+data+' onclick=DownloadPdf(id)><i class="material-icons prefix">file_download</i></button>'
                        }},
                        {"data" : "id",
                        "render" : function(data){

                            var all_perms = '<button class="delete_btn" id='+data+' onclick=deleteTemplate(id)><i class="material-icons prefix">delete</i></button>'

                            var retrievedData = localStorage.getItem("UserPermissions");
                            var userPermissions = JSON.parse(retrievedData);

                            if(!jQuery.isEmptyObject(userPermissions)){
                                var delete_template_flag = userPermissions.includes('delete_template_delete')

                                if(delete_template_flag == true){
                                      return all_perms
                                }
                                      return "-"
                            }
                            else {
                                return 'no action'
                            }
                        }},

            ],
            "columnDefs": [
                {"className": "dt-center", "targets": "_all"}
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
    var table = $("#template_datatable").dataTable().api();
    // var table = $('#user_datatable').DataTable();

    // table.columns.adjust().draw();
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
