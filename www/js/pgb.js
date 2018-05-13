const app = angular.module('MeetApp', []);

app.controller('controller', function ($scope) {

    $scope.beep = function (time) {
        navigator.notification.beep(time)
    }

});

