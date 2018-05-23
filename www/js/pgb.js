const app = angular.module('MeetApp', []);

app.service('storageService', function () {
    this.db = firebase.database();

    this.addUserIfEmpty = async (user) => {
        try {
            let key = prepareKey(user.mail);

            if (key === null || key === undefined || key === "") {
                throw "Mail is not proper."
            }

            let usersRef = this.db.ref().child('users/' + key);
            usersRef.once("value", function (data) {
                try {
                    if (data.val() === null) {
                        usersRef.set(
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
    };

    this.updateUser = async (user) => {
        let key = prepareKey(user.mail);

        try {
            if (key === null || key === undefined || key === "") {
                throw "Mail is not proper."
            }

            let usersRef = this.db.ref().child('users/' + key);
            usersRef.update(user)
        } catch (e) {
            navigator.notification.alert(e)
        }
    };

    this.addGroupAndGetKey = async (group) => {
        try {
            let groupsRef = await this.db.ref().child('groups').push();
            let key = groupsRef.key;
            if (group.name === "" || group.name === null || group.name === undefined) {
                throw "group name not proper."
            }
            groupsRef.set(group);
            return key;
        } catch (e) {
            navigator.notification.alert(e)
        }
    };

    this.updateGroup = async
});

app.controller('controller', function ($scope, storageService) {
    $scope.currentUser = new User();
    $scope.currentGroup = new Group();
    $scope.currentEvent = new Event();

    $scope.addUserIfEmpty = () => {
        try {
            storageService.addUserIfEmpty($scope.currentUser)
        } catch (e) {
            navigator.notification.alert(e)
        }
    };

    $scope.addGroupAndGetKey = () => {
        storageService.addGroupAndGetKey().then((key) => {
            $scope.currentUser.groups.push(key);
            storageService.updateUser($scope.currentUser);
        }
    )
    }
});

function prepareKey(mail) {
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
    if (name === undefined) {
        this.name = "";
    } else {
        this.name = name
    }
    this.members = [];
    this.events = [];
}

function Event(name) {
    if (name === undefined) {
        this.name = "";
    } else {
        this.name = name
    }
    this.participants = [];
}