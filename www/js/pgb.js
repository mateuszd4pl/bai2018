const app = angular.module('MeetApp', []);

app.service('storageService', function () {

});

app.controller('controller', function ($scope) {
    $scope.text = "test";

    $scope.test = function () {
        $scope.text = test("xD")
    };

});

function init() {
    document.addEventListener("deviceready",onDeviceReady, false);
}

function onDeviceReady() {
    navigator.notification.beep(1);
}

