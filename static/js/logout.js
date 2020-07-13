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
        localStorage.removeItem("Token");
        localStorage.removeItem("Role");
        localStorage.removeItem("User");
        localStorage.removeItem("view_user")
        localStorage.removeItem("add_user")
        localStorage.removeItem("edit_user")
        localStorage.removeItem("delete_user")
        window.location.href = "/login/"
      },
        error: function(data){
          if (data.status == 401) {
            getaccessToken();
         }
      }
    })
  }


// download profile 
  function downloadprofile() {
  $.ajax({
      type: 'GET',
      url: '/download/',
      headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
      success: function (data) {
        window.location.href = data.url
      },
        error: function(data){
         if (data.status == 401) {
            getaccessToken();
         }
      }
    })
  };

function changepassword(){
  var token = localStorage.getItem("Token");
  $.ajax({
    type: 'GET',
    url: '/dashboard/get_change_password/',
    headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
    success: function (data) {
      window.location.href = '/dashboard/get_change_password/?token='+ token
    },
    error: function(data){
      if (data.status == 401) {
          getaccessToken();
      }
    }
  })
};

function getUserDashboard(){
  var token = localStorage.getItem("Token");
  $.ajax({
      type: 'GET',
      url: '/dashboard/user_management/',
      headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
      success: function (data) {
      window.location.href = '/dashboard/user_management/?token='+ token
      },
      error: function(data){
      if (data.status == 401) {
          getaccessTokenForUserDashboard();
      }
      }
  })
};

function getaccessTokenForUserDashboard(){
  $.ajax({
      type: 'POST',
      url: '/refresh_token/',
      data : {
        'refresh' : localStorage.getItem("Refresh"),
      },
      success: function (result) {
         localStorage.setItem("Token", result.access);
         token = localStorage.getItem("Token")
         // location.reload();
      //    RegisterUserForm()
         // return false
      //    window.location.href = "/dashboard/?token="+token
      setTimeout(function() {
          window.location.href = "/dashboard/user_management/?token="+token;
        }, 500);

      },
      error: function(data){
         obj = JSON.parse(data.responseText)
         M.toast({html: obj.detail})
      }
})

}

function getTemplateDashboard(){
  var token = localStorage.getItem("Token");
  $.ajax({
      type: 'GET',
      url: '/dashboard/template_management/',
      headers: { Authorization: 'Bearer '+localStorage.getItem("Token")},
      success: function (data) {
      window.location.href = '/dashboard/template_management/?token='+ token
      },
      error: function(data){
      if (data.status == 401) {
          getaccessTokenForTemplateDashboard();
      }
      }
  })
};

function getaccessTokenForTemplateDashboard(){
  $.ajax({
      type: 'POST',
      url: '/refresh_token/',
      data : {
        'refresh' : localStorage.getItem("Refresh"),
      },
      success: function (result) {
         localStorage.setItem("Token", result.access);
         token = localStorage.getItem("Token")
         // location.reload();
      //    RegisterUserForm()
         // return false
      //    window.location.href = "/dashboard/?token="+token
      setTimeout(function() {
          window.location.href = "/dashboard/template_management/?token="+token;
        }, 500);

      },
      error: function(data){
         obj = JSON.parse(data.responseText)
         M.toast({html: obj.detail})
      }
})

}