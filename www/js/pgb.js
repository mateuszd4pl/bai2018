const app = angular.module('MeetApp', []);

app.service('storageService', function () {

});

app.controller('controller', function ($scope) {
    $scope.text = "test";

    $scope.test = function () {
        $scope.text = test();
        deviceInfo();
    };

});

function deviceInfo() {

    info =  'Hi, I am your smartphone :-)' + '\n' +
        '=====' + '\n' +
        'Device Name    : '     + device.name     + '\n' +
        'Device Cordova : '  + device.cordova + '\n' +
        'Device Platform: ' + device.platform + '\n' +
        'Device UUID    : '     + device.uuid     + '\n' +
        'Device Model   : '    + device.model     + '\n' +
        'Device Version : '  + device.version  + '\n';

    navigator.notification.alert(info);

}

let test = () => {return "xD"};

function init() {
    document.addEventListener("deviceready",onDeviceReady, false);
}

function onDeviceReady() {
    navigator.notification.beep(1);
}
