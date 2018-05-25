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
                    print(e);
                }
            });

        } catch (e) {
            print(e);
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
            print(e);
        }
    };

    this.addGroupAndGetKey = async (group) => {
        try {
            let groupsRef = await this.db.ref().child('groups').push();
            let key = groupsRef.key;
            if (group.name === "" || group.name === null || group.name === undefined) {
                throw "group name not proper."
            }
            let newGroup = {};
            Object.assign(newGroup, group);
            delete newGroup.key;
            groupsRef.set(newGroup);

            return key;

        } catch (e) {
            print(e);
        }
    };

    this.updateGroup = async (groupId, group) => {
        try {
            let groupsRef = await this.db.ref().child('groups/' + groupId);
            if (group.name === "" || group.name === null || group.name === undefined) {
                throw "group name not proper."
            }

            let newGroup = {};
            Object.assign(newGroup, group);
            delete newGroup.key;
            groupsRef.set(newGroup)

        } catch (e) {
            print(e)
        }
    };

    this.addMessage = async (message) => {
        let messagesRef = await this.db.ref().child('messages/').push();
        let key = messagesRef.key;
        messagesRef.set(message);
        return key;
    };

    this.addMessageToGroup = async (groupId ,messageId) => {
        let groupsRef = await this.db.ref().child('groups/' + groupId+"/chat/").push(messageId);

    };

    this.observeGroup = (groupId, task) => {
        this.db.ref().child("groups/" + groupId + '/chat/').on("child_added", (child) => {
            task(child);
        });
    };

    this.unobserveGroup = (groupId) => {
        this.db.ref().child("groups/" + groupId + '/chat/').off("child_added");
    }
});

app.controller('controller', function ($scope, storageService) {
    $scope.currentUser = new User();
    $scope.currentGroup = new Group();
    $scope.currentEvent = new Event();
    $scope.currentMessage = new Message();
    $scope.currentChat = [];

    $scope.addUser = () => {
        try {
            storageService.addUserIfEmpty($scope.currentUser)
        } catch (e) {
            print(e);
        }
    };

    $scope.addGroup = () => {
        storageService.addGroupAndGetKey($scope.currentGroup).then((key) => {
                if (key !== null && key !== "" && key !== undefined) {
                    $scope.currentUser.groups.push(key);
                    storageService.updateUser($scope.currentUser);
                    let oldKey = $scope.currentGroup.key;
                    $scope.currentGroup.key = key;

                    $scope.changeGroup(key, oldKey);
                }
            }
        ).then(() => {
            $scope.$apply()
        });
    };

    $scope.sendMessage = () => {
        let date = new Date();

        $scope.currentMessage.time = date.getTime();
        $scope.currentMessage.author = $scope.currentUser.name;

        storageService.addMessage($scope.currentMessage).then((key) => {
            storageService.addMessageToGroup($scope.currentGroup.key, key)
            // $scope.currentGroup.chat.push(key);
            // storageService.updateGroup($scope.currentGroup.key, $scope.currentGroup);
        }).then(() => {
            $scope.$apply();
        })
    };

    $scope.changeGroup = (groupId1, groupId2) => {
        storageService.unobserveGroup(groupId2);
        storageService.observeGroup(groupId1, (child) => {
            $scope.currentGroup.chat.push(child.val());
            storageService.db.ref().child("messages/" + child.val()).once("value", (data) => {
                $scope.currentChat.push(data.val())
            });

            // $scope.currentGroup.chat.forEach((key) => {
            //     storageService.db.ref().child("messages/" + key).once("value", (data) => {
            //         print(data.val());
            //         print($scope.currentChat);
            //         print($scope.currentChat.indexOf(data.val()));
            //
            //         if($scope.currentChat.indexOf(data.val())===-1){
            //             $scope.currentChat.push(data.val())
            //         }
            //     }).then(() => {
            //         $scope.$apply()
            //     });
            // });
        })
    }
});

function prepareKey(str) {
    return str.replace(/\./g, '');
}

function print(e) {
    console.log(e);
    // navigator.notification.alert(e)
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
    this.chat = [];
}

function Event(name) {
    if (name === undefined) {
        this.name = "";
    } else {
        this.name = name
    }
    this.participants = [];
}

function Message(author, time, content) {
    this.author = author;
    this.time = time;
    this.content = content;
}