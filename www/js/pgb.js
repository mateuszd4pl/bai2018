const app = angular.module('MeetApp', []);

app.service('storageService', ()=> {
    this.db = firebase.database();

    this.addUserIfEmpty = async (user, callback) => {
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
                        ).then(()=>{
                          callback();
                        });
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

    this.assignGroupToUser = async (mail, groupId) => {
        let key = prepareKey(mail);

        let usersRef = this.db.ref().child('users/' + key);
        let usersGroupsRef = this.db.ref().child('users/' + key + "/groups").push();
        let groupsRef = this.db.ref().child("groups/" + groupId);
        groupsRef.once("value", function (data) {
            try {
                if (data.val() !== null) {
                    usersRef.once("value", function (data) {
                        try {
                            if (data.val() !== null) {
                                usersGroupsRef.once("value", (data) => {
                                    try {
                                        if (data.val() !== null) {
                                            if (data.val().indexOf(groupId) === -1) {
                                                usersGroupsRef.set(groupId);
                                            } else {
                                                throw "user already is in the group!"
                                            }
                                        } else {
                                            usersGroupsRef.set(groupId);
                                        }
                                    } catch (e) {
                                        print(e)
                                    }
                                });

                            } else {
                                throw "no such user!"
                            }
                        } catch (e) {
                            print(e);
                        }
                    })
                } else {
                    throw "no such group!"
                }
            } catch (e) {
                print(e)
            }
        });
    };

    this.addUserToGroup = async (mail, groupId) => {
        let key = prepareKey(mail);
        let usersRef = this.db.ref().child('users/' + key);
        let groupsRef = this.db.ref().child("groups/" + groupId);
        let membersRef = this.db.ref().child("groups/" + groupId + "/members").push();
        groupsRef.once("value", function (data) {
            try {
                if (data.val() !== null) {
                    usersRef.once("value", function (data) {
                        try {
                            if (data.val() !== null) {
                                membersRef.set(key);
                            } else {
                                throw "no such user!"
                            }
                        } catch (e) {
                            print(e);
                        }
                    })
                } else {
                    throw "no such group!"
                }
            } catch (e) {
                print(e)
            }
        });
    };

    this.addMessage = async (message) => {
        let messagesRef = await this.db.ref().child('messages/').push();
        let key = messagesRef.key;
        messagesRef.set(message);
        return key;
    };

    this.addMessageToGroup = async (groupId, messageId) => {
        let groupsRef = await this.db.ref().child('groups/' + groupId + "/chat/").push(messageId);

    };

    this.observeGroup = (groupId, task) => {
        this.db.ref().child("groups/" + groupId + '/chat/').on("child_added", (child) => {
            task(child);
        });
    };

    this.unobserveGroup = (groupId) => {
        this.db.ref().child("groups/" + groupId + '/chat/').off("child_added");
    };

    this.observeUserGroups = (mail, task) => {
        this.db.ref().child("users/" + prepareKey(mail) + "/groups/").on("child_added", (child) => {
            print("hello");
            task(child)
        })
    }
});

app.controller('controller', function ($scope, storageService) {
    $scope.currentUser = new User();
    $scope.otherUser = new User();
    $scope.currentGroup = new Group();
    $scope.currentEvent = new Event();
    $scope.currentMessage = new Message();
    $scope.currentChat = [];

    $scope.addUser = () => {
        try {
            storageService.addUserIfEmpty($scope.currentUser, ()=> {
                $scope.loadUser();
            })
        } catch (e) {
            print(e);
        }
    };

    $scope.addGroup = () => {
        storageService.addGroupAndGetKey($scope.currentGroup).then((key) => {
                // $scope.currentUser.groups.push(key);
                // storageService.updateUser($scope.currentUser);
                storageService.addUserToGroup($scope.currentUser.mail, key);
                storageService.assignGroupToUser($scope.currentUser.mail, key);
                $scope.changeGroup(key);
            }
        ).then(() => {
            $scope.$apply()
        });
    };

    $scope.addUserToGroup = (user) => {
        storageService.addUserToGroup(user.mail, $scope.currentGroup.key);
        storageService.assignGroupToUser(user.mail, $scope.currentGroup.key);
    };

    $scope.sendMessage = () => {
        let date = new Date();

        $scope.currentMessage.time = date.getTime();
        $scope.currentMessage.author = $scope.currentUser.name;

        storageService.addMessage($scope.currentMessage).then((key) => {
            storageService.addMessageToGroup($scope.currentGroup.key, key)
        }).then(() => {
            $scope.$apply();
        })
    };

    $scope.loadUser = async () => {
        let key = prepareKey($scope.currentUser.mail);
        storageService.db.ref().child("users/" + key).once("value", async (data) => {
            $scope.currentUser = data.val();
            print($scope.currentUser.mail);
            storageService.observeUserGroups($scope.currentUser.mail, (child) => {
                print($scope.currentUser.mail);
                if($scope.currentUser.groups === null || $scope.currentUser.groups===undefined){
                    $scope.currentUser.groups=[];
                }
                print(child.val());
                $scope.currentUser.groups.push(child.val());
                if (($scope.currentGroup === {} || $scope.currentGroup === null)) {
                    let key = $scope.currentUser.groups[0];
                    $scope.changeGroup(key);
                }
            });
        });
    };

    $scope.changeGroup = (groupId) => {

        if($scope.currentGroup.key !== null || $scope.currentGroup.key !==undefined){
            storageService.unobserveGroup($scope.currentGroup.key);
        }

        storageService.db.ref().child("groups/" + groupId).once("value", async (data) => {
            $scope.currentGroup = data.val();
            $scope.currentGroup.key = groupId;

            storageService.observeGroup(groupId, (child) => {
                if ($scope.currentGroup.chat === null || $scope.currentGroup.chat === undefined) {
                    $scope.currentGroup.chat = []
                }
                $scope.currentGroup.chat.push(child.val());
                storageService.db.ref().child("messages/" + child.val()).once("value", (data) => {
                    $scope.currentChat.push(data.val())
                });
            })
        });
        print($scope.currentGroup);
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