var userDetails = getValues('UserDetails')
var refresh = userDetails.refresh

// get access token when expired for functions
function getaccessToken(fn){

    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data : {
            'refresh' : refresh,
        },
        success: function (result) {
            updateItem('UserDetails', 'access', result.access);

            fn();
        },
        error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
        }
    })
}

// get access token when expired for urls
function getaccessTokenForUrl(get_url){

    $.ajax({
        type: 'POST',
        url: '/refresh_token/',
        data : {
            'refresh' : refresh,
        },
        success: function (result) {
            updateItem('UserDetails', 'access', result.access);
            var userDetails = getValues('UserDetails')
            var token = userDetails.access

            setTimeout(function() {
                window.location.href = get_url;
            }, 500);

        },
        error: function(data){
            obj = JSON.parse(data.responseText)
            M.toast({html: obj.detail})
        }
    })
}


function getaccessTokenForMainDashboard(fn){
  $.ajax({
          type: 'POST',
          url: '/refresh_token/',
          data : {
              'refresh' : refresh,
          },
          success: function (result) {
              updateItem('UserDetails', 'access', result.access);
              var userDetails = getValues('UserDetails')
              var token = userDetails.access
              id = window.localStorage.getItem("editedUserId")
          },
          error: function(data){
              obj = JSON.parse(data.responseText)
              M.toast({html: obj.detail})
          }
  })
}

function getaccessTokenForTemplateDashboard(fn){
  $.ajax({
          type: 'POST',
          url: '/refresh_token/',
          data : {
              'refresh' : refresh,
          },
          success: function (result) {
              updateItem('UserDetails', 'access', result.access);
              var userDetails = getValues('UserDetails')
              var token = userDetails.access
              id = window.localStorage.getItem("editedUserId")
          },
          error: function(data){
              obj = JSON.parse(data.responseText)
              M.toast({html: obj.detail})
          }
  })
}


function getaccessTokenUserDashboard(fn){

    $.ajax({
            type: 'POST',
            url: '/refresh_token/',
            data : {
                'refresh' : refresh,
            },
            success: function (result) {
                updateItem('UserDetails', 'access', result.access);
                var userDetails = getValues('UserDetails')
                var token = userDetails.access

                id = window.localStorage.getItem("editedUserId")
                fn(id)
            },
            error: function(data){
                obj = JSON.parse(data.responseText)
                M.toast({html: obj.detail})
            }
    })
 }


 function getaccessTokenFormEvent(fn){

    $.ajax({
            type: 'POST',
            url: '/refresh_token/',
            data : {
                'refresh' : refresh,
            },
            success: function (result) {
                updateItem('UserDetails', 'access', result.access);
                var userDetails = getValues('UserDetails')
                var token = userDetails.access

                id = window.localStorage.getItem("fill_form_event")
                fn(id)
            },
            error: function(data){
                obj = JSON.parse(data.responseText)
                M.toast({html: obj.detail})
            }
    })
 }

function getObject(key) {
    return JSON.parse(localStorage.getItem(key));
}

function setObject(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
}

function updateItem(key, property, value)
{
    var obj = getObject(key);
    obj[property] = value;
    setObject(key, obj);
}

function getValues(key){
    var retrievedData = localStorage.getItem(key);
    var values = JSON.parse(retrievedData);
    return values
}
