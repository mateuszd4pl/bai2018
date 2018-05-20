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
        storageService.saveUser($scope.currentUser)
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

    this.addFriend = (userId)=>{this.friends.push(userId)};
    this.addToGroup = (groupId)=>{this.groups.push(groupId)}
}

function Group(name) {
    this.name = name;
    this.members = [];
    this.events = [];

    this.addMember = (userId)=>{this.members.push(userId)};
    this.addEvent = (event)=>{this.events.push(event)};
}

function Event(name) {
    this.name = name;

    this.participants = [];

    this.addParticipant = (userId)=>{this.participants.push(userId)}
}