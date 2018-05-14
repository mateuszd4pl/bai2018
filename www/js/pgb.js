const app = angular.module('MeetApp', []);

app.controller('controller', function ($scope) {
    $scope.text = "test";

    $scope.test = function () {
        $scope.text = "tested";
    }

});

