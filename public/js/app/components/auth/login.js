enyine.component('login', {
  templateUrl: '/js/app/components/auth/login.html',
  restrict: 'E',
  controller: ['$scope','$state', 'authService', 'userService','notifier', AuthController]
});

function AuthController($scope, $state, authService, userService, notifier) {
  var ctrl = this;

  ctrl.user = {
    username: '',
    password: ''
  }

  //setRedirectUrl();
  function setRedirectUrl() {
    var redirectUrl = window.location.hash.split("redirect=");
    if(redirectUrl.length==2)
      ctrl.redirectUrl = window.location.hash.split("redirect=")[1];
  };


  ctrl.passwordValid = function() {
    return ctrl.user.passwordCheck === ctrl.user.password;
  }

  //
  // Login
  ctrl.login = function() {
    setRedirectUrl();
    authService.login(ctrl.user, ctrl.redirectUrl).success(function(data) {
      var user = data.user;
      var token = data.token;
      var redirect = data.redirect;
      userService.setUser({id:user.id, username: user.username, email: user.email});

      /*userService.update(user).then(function() {
          alert("updated user")
        });*/

      if(redirect) {
        if(redirect.indexOf('http') == 0)
          window.location.href = redirect;
        else
          window.location.href = "/#" + redirect;
      }
      else
        $state.go('in.dash');
    }).error(function(data) {
      if(data.message)
        notifier.error(data.message);
      else
        notifier.error("Please check your input for username and password or create a new account.", "Login failed :-(");
    });

  }

  ctrl.loginGoogle = function() {
    setRedirectUrl();      
    authService.loginGoogle(ctrl.redirectUrl).then(function() {
    }, function(err) {
        notifier.error("Something went wrong :-(");      
    });
  }

}