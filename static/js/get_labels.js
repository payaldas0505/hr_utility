function get_labels(page_name){
    let language_id = localStorage.getItem('language')
    $.ajax({
        type: 'POST',
        url: '/get_labels/',
        data : {
        	'page_name' : page_name,
        	'language_id' : language_id,
		    },
        success: function (jsondata) {
            console.log(jsondata)
            for (const [key, value] of Object.entries(jsondata)) {
                console.log(key, value);
                $('.'+value.page_label_class_name).text(value.page_label_text);
              }
        },
        error: function(xhr){
            let obj = JSON.parse(xhr.responseText)
            M.toast({html: obj.error, classes: 'red rounded'})
        }
    });
}