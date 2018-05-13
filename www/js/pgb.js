const app = angular.module('MeetApp', []);

app.controller('controller', function ($scope) {

});

function init() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
    navigator.notification.beep(2);
    deviceInfo();
}

