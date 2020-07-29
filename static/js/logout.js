// log out

function logout() {
  var userDetails = getValues('UserDetails')
  var access = userDetails.access
  $.ajax({
      type: 'GET',
      url: '/logout/',
      headers: { Authorization: 'Bearer '+ access},
      success: function (result) {
  
        window.localStorage.clear();
        window.location.href = "/login/"
      },
        error: function(data){
          if (data.status == 401) {
            getaccessToken(logout);
            
         }
      }
    })
  }






