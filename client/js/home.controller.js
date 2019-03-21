'user strict';

app.controller('homeController', function ($scope, $routeParams, $location, appService){
    
    const UserId = $routeParams.userId;

    $scope.data = {
        username: '',
        lastname: '',
        firstname: '',
        chatlist: [],
        selectedFriendId: null,
        selectedFriendUsername: null,
        selectedFriendLastname: null,
        selectedFriendFirstname: null,
        messages: []
    };

    appService.connectSocketServer(UserId);

    appService.httpCall({
        url: '/userSessionCheck',
        params: {
            'userId': UserId
        }
    })
    .then((response) => {
        usernamess = response.username;
        $scope.data.username = usernamess.charAt(0).toUpperCase() + usernamess.substr(1);
        appService.socketEmit(`chat-list`, UserId);
        appService.socketOn('chat-list-response', (response) => {
            $scope.$apply( () =>{
                if (!response.error) 
                {
                    if (response.singleUser) 
                    {
                        if ($scope.data.chatlist.length > 0) {
                            $scope.data.chatlist = $scope.data.chatlist.filter(function (obj) {
                                return obj.id !== response.chatList.id;
                            });
                        }

                        $scope.data.chatlist.push(response.chatList);
                    } else if (response.userDisconnected) {

                        $scope.data.chatlist = $scope.data.chatlist.filter(function (obj) {
                            return obj.socketid !== response.socketId;
                        });
                    } else {

                        $scope.data.chatlist = response.chatList;
                    }
                } else {
                    alert(`Failed to load Chat list`);
                }
            });
        });


        appService.socketOn('add-message-response', (response) => {
            $scope.$apply( () => {
                if (response && response.fromUserId == $scope.data.selectedFriendId) {
                    $scope.data.messages.push(response);
                    appService.scrollToBottom();
                }
            });
        });       
    })
    .catch((error) => {
        console.log(error.message);
        $scope.$apply( () =>{
            $location.path(`/`);
        });
    });
            
    $scope.selectFriendToChat = (friendId) => {

        const friendData = $scope.data.chatlist.filter((obj) => {
            return obj.id === friendId;
        });

        $scope.data.selectedFriendLastname = friendData[0]['lastname'];
        $scope.data.selectedFriendFirstname = friendData[0]['firstname'];
        $scope.data.selectedFriendId = friendId;
        appService.getMessages(UserId, friendId).then( (response) => {
            $scope.$apply(() => {
                $scope.data.messages = response.messages;
            });
        }).catch( (error) => {
            console.log(error);
            swal("Error!", 'Unexpected Error!', "error");
        });
        document.getElementById("message").disabled = false;
        var messageThread = document.getElementById("convo");
        setTimeout(() => {
            messageThread.scrollTop = messageThread.scrollHeight + messageThread.scrollHeight;
        }, 10);
    }

    $scope.sendMessage = (event) => {
        if (event.keyCode === 13) 
        {

            let toUserId = null;
            let toSocketId = null;
            let selectedFriendId = $scope.data.selectedFriendId;
            if (selectedFriendId === null) {
                return null;
            }
            friendData = $scope.data.chatlist.filter((obj) => {
                return obj.id === selectedFriendId;
            });
            let messagess = document.querySelector("#message").value;
            if (friendData.length <= 0)
            {
                swal("Error!", 'Unexpected Error Occured!', "error");
            }
            else
            {
                if(messagess.trim() === '' || messagess.trim() === undefined || messagess.trim() === null)
                {
                    swal("Error!", 'Your Message is empty', "error");
                    $('#message').val('').blur();
                }
                else
                {
                    toUserId = friendData[0]['id'];
                    toSocketId = friendData[0]['socketid'];

                    let messagePacket = {
                        message: messagess,
                        fromUserId: UserId,
                        toUserId: toUserId,
                        toSocketId: toSocketId
                    };
                    $scope.data.messages.push(messagePacket);
                    appService.socketEmit(`add-message`, messagePacket);
                    appService.scrollToBottom();
                    $('#message').val('').blur();
                }
            }
        }
    }
    $scope.alignMessage = (fromUserId, toUserId) => {
        return fromUserId == UserId ? true : false;
        return toUserId == toUserId ? true : false;
    }

    $scope.logout = () => {
        appService.socketEmit(`logout`, UserId);
        $location.path(`/`);
    }
});