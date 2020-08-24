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
							M.toast({html: 'Please check your email!', outDuration: 2000, classes: 'green rounded'})
							setTimeout(function() {
								window.location.href = '/login/';
					  }, 3000);
		        }
		    })
		}
