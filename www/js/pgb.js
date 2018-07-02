const app = angular.module('MeetApp', []);

app.service('storageService', function () {
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
                        ).then(() => {
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
            let groupsRef = this.db.ref().child('groups').push();
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
            let groupsRef = this.db.ref().child('groups/' + groupId);
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
        let messagesRef = this.db.ref().child('messages/').push();
        let key = messagesRef.key;
        messagesRef.set(message);
        return key;
    };

    this.addMessageToGroup = async (groupId, messageId) => {
        this.db.ref().child('groups/' + groupId + "/chat/").push(messageId);
    };

    this.addEvent = async (groupId, event) => {
        let eventsRef = this.db.ref().child("events/").push(event);
        let key = eventsRef.key;
        let groupRef = this.db.ref().child("groups/" + groupId + "/events").push(key);
    };

    this.observeGroupChat = (groupId, task) => {
        this.db.ref().child("groups/" + groupId + '/chat/').on("child_added", (child) => {
            task(child);
        });
    };

    this.unobserveGroupChat = (groupId) => {
        this.db.ref().child("groups/" + groupId + '/chat/').off("child_added");
    };

    this.observeGroupMembers = (groupId, task) => {
        this.db.ref().child("groups/" + groupId + '/events/').on("child_added", (child) => {
            task(child);
        })
    };

    this.unobserveGroupMembers = (groupId) => {
        this.db.ref().child("groups/" + groupId + '/events/').off("child_added");
    };

    this.observeGroupEvents = (groupId, task) => {
        this.db.ref().child("groups/" + groupId + '/events/').on("child_added", (child) => {
            task(child);
        })
    };

    this.unobserveGroupEvents = (groupId) => {
        this.db.ref().child("groups/" + groupId + '/events/').off("child_added");
    };

    this.observeEvent = (eventId, task) => {
        this.db.ref().child("events/" + eventId).on("value", (child) => {
            task(child);
        });
    };

    this.unobserveEvent = (eventId) => {
        this.db.ref().child("events/" + eventId).off("child_added");
    };

    this.observeUserGroups = (mail, task) => {
        this.db.ref().child("users/" + prepareKey(mail) + "/groups/").on("child_added", (child) => {
            task(child)
        })
    };

    this.observeUserFriends = (mail, task) => {
        this.db.ref().child("users/" + prepareKey(mail) + "/friends/").on("child_added", (child) => {
            task(child)
        })
    };
});

app.controller('controller', function ($scope, storageService) {
        $scope.currentUser = new User();
        $scope.otherUser = new User();
        $scope.currentGroup = null;
        $scope.otherGroup = new Group();
        $scope.currentEvent = new Event();
        $scope.currentMessage = new Message();
        $scope.password = null;

        $scope.addUser = () => {
            try {
                storageService.addUserIfEmpty($scope.otherUser, () => {
                    $scope.loadUser($scope.otherUser).then(()=>{
                        $scope.otherUser = new User();
                        $scope.$apply();
                    });
                })
            } catch (e) {
                print(e);
            }
        };

        $scope.addGroupAndAssignUser = () => {
            storageService.addGroupAndGetKey($scope.otherGroup).then((key) => {
                storageService.addUserToGroup($scope.currentUser.mail, key).then(() => {
                    storageService.assignGroupToUser($scope.currentUser.mail, key).then(() => {
                        $scope.changeGroup(key);
                    });
                });
            }).then(() => {
                $scope.$apply()
            });
        };

        $scope.addUserToGroup = async (user, group) => {
            storageService.addUserToGroup(user.mail, group.key);
            storageService.assignGroupToUser(user.mail, group.key);
        };

        $scope.sendMessage = () => {
            let date = new Date();

            $scope.currentMessage.time = date.getTime();
            $scope.currentMessage.author = $scope.currentUser.mail;

            storageService.addMessage($scope.currentMessage).then((key) => {
                storageService.addMessageToGroup($scope.currentGroup.key, key)
            }).then(() => {
                $scope.$apply();
            })
        };

        $scope.loadUser = async (user) => {
            let key = prepareKey(user.mail);
            storageService.db.ref().child("users/" + key).once("value", async (data) => {
                $scope.currentUser = new User(data.val().mail, data.val().name, data.val().lastname, data.val().phone);
                $scope.observeUser(user.mail);
                $scope.$apply()
            });
        };

        $scope.changeGroup = async (groupId) => {
            $scope.unobserveCurrentGroup();
            $scope.loadGroup(groupId).then(()=>{
                $scope.setGroups();
            });
            $scope.observeGroup(groupId);
        };

        $scope.loadGroup = async (groupId)=>{
             await storageService.db.ref().child("groups/" + groupId).once("value", (data) => {
                data = data.val();
                $scope.otherGroup = new Group(data.name);
                $scope.otherGroup.key = groupId;
            })
        };

        $scope.loadEvent = (eventId) => {
            storageService.unobserveEvent($scope.currentEvent.key);

            storageService.db.ref().child("events/"+eventId).once("value", (data)=>{
                $scope.currentEvent = data.val();
                $scope.currentEvent.key = eventId;
                storageService.observeEvent(eventId, (child) => {
                    $scope.currentEvent = child.val();
                })
            });
        };

        $scope.unobserveCurrentGroup = () => {
            if ($scope.currentGroup !== null && ($scope.currentGroup.key !== null || $scope.currentGroup.key !== undefined)) {
                storageService.unobserveGroupChat($scope.currentGroup.key);
                storageService.unobserveGroupMembers($scope.currentGroup.key);
                storageService.unobserveGroupEvents($scope.currentGroup.key);
            }
        };

        $scope.observeUser = (mail) => {
            storageService.observeUserGroups(mail, (child) => {
                // $scope.currentUser.groups.push(child.val());
                $scope.loadGroup(child.val()).then(()=>{
                    let element={};
                    Object.assign(element, $scope.otherGroup);
                    $scope.currentUser.groups.push(element);
                    $scope.otherGroup=new Group();
                    $scope.$apply();
                }).then(()=>{
                    if (($scope.currentGroup === {} || $scope.currentGroup === null)) {
                        let key = $scope.currentUser.groups[0].key;
                        $scope.changeGroup(key);
                    }
                });
            });

            storageService.observeUserFriends(mail, (child) => {
                storageService.db.ref().child("users/" + child.val()).once("value", (data) => {
                    $scope.currentUser.friends.push(data.val())
                    $scope.$apply();
                });
            });
        };

        $scope.observeGroup = (groupId) => {
            storageService.observeGroupChat(groupId, (child) => {
                storageService.db.ref().child("messages/" + child.val()).once("value", (data) => {
                    $scope.currentGroup.chat.push(data.val());
                    $scope.$apply();
                });
            });

            storageService.observeGroupEvents(groupId, (child) => {
                storageService.db.ref().child("events/" + child.val()).once("value", (data) => {
                    $scope.currentGroup.events.push(data.val());
                    $scope.$apply();
                })
            });

            storageService.observeGroupMembers(groupId, (child) => {
                storageService.db.ref().child("users/" + child.val()).once("value", (data) => {
                    $scope.currentGroup.members.push(data.val());
                    $scope.$apply();
                })
            })
        };

        $scope.setGroups = ()=>{
            $scope.currentGroup = $scope.otherGroup;
            $scope.otherGroup = new Group();
            $scope.$apply();
        };

        $scope.clearOtherUser = ()=>{
            $scope.otherUser = new User();
        }
    }
);

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