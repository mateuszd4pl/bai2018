const app = angular.module('MeetApp', []);

app.service('storageService', function () {
    this.db = firebase.database();

    this.saveUser = async (user) => {
        try {
            let key = user.mail;

            let usersRef = this.db.ref().child('users');
            usersRef.set(
                {[key]: user}
            );
            return key;
        } catch (e) {
            console.log(e)
        }
    }
});

app.controller('controller', function ($scope, storageService) {
    $scope.currentUser = new User();

    $scope.saveUser = function saveUser() {
        try{
            storageService.saveUser($scope.currentUser)
        } catch (e) {
            navigator.notification.alert(e)
        }
    }
});

function init() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {

}


function User(mail, name, lastname, phone) {

    if (mail === undefined) {
        this.mail = "";
    } else {
        this.mail = mail
    }

    if (name === undefined) {
        this.name = "";
    } else {
        this.name = name
    }

    if (lastname === undefined) {
        this.lastname = "";
    } else {
        this.lastname = lastname;
    }

    if (mail === undefined) {
        this.phone = ""
    } else {
        this.phone = phone;
    }

    this.friends = [];
    this.groups = [];
}

function Group(name) {
    this.name = name;
    this.members = [];
    this.events = [];
}

function Event(name) {
    this.name = name;
    this.participants = [];
}