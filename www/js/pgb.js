const app = angular.module('MeetApp', []);

app.service('storageService', function () {
    this.db = firebase.database();

    this.addUserIfEmpty = async (user) => {
        try {
            let key = createKeyFromMail(user.mail);

            if (key === null || key === undefined || key === "") {
                throw "Mail is not proper."
            }

            let usersRef = this.db.ref().child('users/' + key);
            usersRef.once("value", function (data) {
                try {
                    if (data.val() === null) {
                        usersRef.update(
                            user
                        );
                    } else {
                        throw "User already exists!"
                    }
                } catch (e) {
                    navigator.notification.alert(e)
                }
            });

        } catch (e) {
            navigator.notification.alert(e)
        }
    }
});

app.controller('controller', function ($scope, storageService) {
    $scope.currentUser = new User();

    $scope.addUserIfEmpty = function saveUser() {
        try {
            storageService.addUserIfEmpty($scope.currentUser)
        } catch (e) {
            navigator.notification.alert(e)
        }
    }
});

function createKeyFromMail(mail) {
    return mail.replace(/\./g, '');
}

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