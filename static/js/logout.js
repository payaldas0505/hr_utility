// log out

function logout() {
  var userDetails = getValues('UserDetails')
  var access = userDetails.access
  $.ajax({
      type: 'GET',
      url: '/logout/',
      headers: { Authorization: 'Bearer '+ access},
      success: function (data) {
        // parsed_jsondata = JSON.parse(result)
        // console.log('result',parsed_jsondata)
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.href = data.url;

        // location.href = result['template_name'];
      },
        error: function(data){
          if (data.status == 401) {
            getaccessToken(logout);

         }
      }
    })
  }
