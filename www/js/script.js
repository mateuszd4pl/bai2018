$(document).on("pagecreate","#pageone",function(){
    $("p").on("swipeleft",function(){
        window.location.href = "#mainGroup";
    });
});

var options = {
    date: new Date(),
    mode: 'date',
    is24Hour: 'true',
    androidTheme: "THEME_HOLO_LIGHT",
};

function onSuccess(date) {
    alert('Selected date: ' + date);
}

function onError(error) { // Android only
    alert('Error: ' + error);
}
