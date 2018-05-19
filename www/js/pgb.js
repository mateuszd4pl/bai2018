const app = angular.module('MeetApp', []);

app.service('userStorageService', function () {
    this.db = firebase.database();

     this.saveUser = async (user)=>{
         try {
             let pushRef = this.db.ref().child('users').push();
             let key = pushRef.key;
             this.db.ref('users/'+key).set(user);
             return key;
         } catch (e) {
             console.log(e)
         }
    }
});

app.controller('controller', function ($scope, userStorageService) {
    $scope.user = {};

    $scope.saveUser = async function saveUser(user) {
        $scope.user.id = userStorageService.saveUser(user).then(()=>{console.log($scope.user)});
    }
});


// function User(mail, name, lastname, phone) {
//     this.mail = mail;
//     this.name = name;
//     this.lastname = lastname;
//     this.phone = phone;
// }

function init() {
    document.addEventListener("deviceready",onDeviceReady, false);
}

function onDeviceReady() {

}
