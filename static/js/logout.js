// log out

function logout() {
    var userDetails = getValues('UserDetails')
    var access = userDetails.access
    $.ajax({
        type: 'GET',
        url: '/logout/',
        headers: { Authorization: 'Bearer ' + access },
        success: function(data) {
            window.localStorage.clear();
            window.sessionStorage.clear();
            window.location.href = data.url;
        },
        error: function(data) {
            if (data.status == 401) {
                getaccessToken(logout);

            }
        }
    })
}
