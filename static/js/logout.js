// get access token when expired
function getaccessToken(){

   $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data : {
          'refresh' : localStorage.getItem("Refresh"),
        },
        success: function (result) {
          localStorage.setItem("Token", result.access);
        },
        error: function(data){
           obj = JSON.parse(data.responseText)
           M.toast({html: obj.detail})
        }
  })
}


// log out
function logout() {
  $.ajax({
      type: 'GET',
      url: '/logout/',
      headers: { Authorization: 'Bearer '+ localStorage.getItem("Token")},
      success: function (result) {
  
        window.localStorage.clear();
        window.location.href = "/login/"
      },
        error: function(data){
          if (data.status == 401) {
            getaccessTokenlogout();
            
         }
      }
    })
  }

// get access token when expired
function getaccessTokenlogout(){

  $.ajax({
       type: 'POST',
       url: '/refresh_token/',
       data : {
         'refresh' : localStorage.getItem("Refresh"),
       },
       success: function (result) {
         logout();
       },
       error: function(data){
          obj = JSON.parse(data.responseText)
          M.toast({html: obj.detail})
       }
 })
}




