$(document).on("pagecreate","#pageone",function(){
    $("p").on("swipeleft",function(){
        window.location.href = "#mainGroup";
    });
});

var options = {
    date: new Date(),
    mode: 'date'
};

function onSuccess(date) {
    alert('Selected date: ' + date);
}

function onError(error) { // Android only
    alert('Error: ' + error);
}
