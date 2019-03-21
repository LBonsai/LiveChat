'user strict';

app.controller('authController', function ($scope, $location, $timeout, appService) {

    $scope.data = {
        regUsername : '',
        regPassword : '',
        regFirstname : '',
        regLastname : '',
        usernameAvailable : false,
        loginUsername : '',
        loginPassword : ''
    };
    let TypeTimer;
    const TypingInterval = 800;

    
    $scope.initiateCheckUserName = () => 
    {
        $scope.data.usernameAvailable = false;
        $timeout.cancel(TypeTimer);
        TypeTimer = $timeout( () => {
            appService.httpCall({
                url: '/usernameCheck',
                params: {
                    'username': $scope.data.regUsername
                }
            })
            .then((response) => {
                $scope.$apply( () =>{
                    $scope.data.usernameAvailable = response.error ? true : false;
                });
            })
            .catch((error) => {
                $scope.$apply(() => {
                    $scope.data.usernameAvailable = true;
                });
               
            });
        }, TypingInterval);
    }
    $scope.clearCheckUserName = () => {
        $timeout.cancel(TypeTimer);
    }

    $scope.hideShowPasswordInLogin = () =>
    {   
        var pass = document.getElementById("login-password");
            if (pass.type === 'password')
                pass.type = 'text';
            else
                pass.type = 'password';
    }

    $scope.hideShowPasswordInRegistration = () =>
    {   
        var pass = document.getElementById("reg-password");
            if (pass.type === 'password')
                pass.type = 'text';
            else
                pass.type = 'password';
    }

    $scope.registerUser = () => {
        appService.httpCall({
            url: '/registerUser',
            params: {
                'firstname': $scope.data.regFirstname,
                'lastname': $scope.data.regLastname,
                'username': $scope.data.regUsername,
                'password': $scope.data.regPassword                
            }
        })
        .then((response) => {
            swal("Congratulations!", error.message, "success");
            $('.username').val('');
            $('#lastname').val('');
            $('#firstname').val('');
            $('#reg-password').val('');
        })
        .catch((error) => {
            swal("Ooooops!", error.message, "error");
        });
    }

    $scope.loginUser = () => {
        appService.httpCall({
            url: '/login',
            params: 
            {
                'username': $scope.data.loginUsername,
                'password': $scope.data.loginPassword
            }
        })
        .then((response) => {
            $location.path(`/home/${(response.userId)}`);
            $scope.$apply();
        })
        .catch((error) => {
            swal("Ooooops!", error.message, "error");
        });
    }
});