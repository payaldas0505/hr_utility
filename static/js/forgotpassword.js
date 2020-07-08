$(document).ready(function(){
    // setTimeout(function() {
    //     GetPermissions()
	//   }, 2000);
	// var language_id = localStorage.getItem('language')
    // $.ajax({
    //     type: 'POST',
    //     url: '/v2s/get_labels/',
    //     data : {
    //     	'page_name' : 'reset_password',
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
});
// send mail to resert password
	var token = '{{csrf_token}}';
	
    	function resetPassword() {
			$("#reset_password").attr("disabled", true);
		    $.ajax({
		        type: 'POST',
		        url: '/api/rest-auth/password/reset/',
		        headers: { "X-CSRFToken": token },
		        data: {
		        	"email" : $('#email').val(),
		        	"csrfmiddlewaretoken": '{{ csrf_token }}'
		        },
		        success: function (result) {
		            // alert("Please check your email")
					M.toast({html: 'Please check your email!', outDuration: 2000, classes: 'green rounded'})
					setTimeout(function() {
						window.location.href = '/login/';
					  }, 3000);
		        }
		    })
		}