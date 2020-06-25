enyine.component('activate', {
  templateUrl: '/js/app/components/auth/activate.html',
  restrict: 'E',
  controller: ['$scope','$state', 'authService', 'notifier', AccountActivationController]
});


function AccountActivationController($scope, $state, authService, notifier) {
  var ctrl = this;

  ctrl.$onInit = function() {
    ctrl.user = {
      username: '',
      password: ''
    }

    ctrl.token = $state.params.token;
    ctrl.passwordReset = $state.params.reset ? true : false;

    if(ctrl.token) {
      authService.getUserInfo(ctrl.token)
        .success(function(user) {
          ctrl.user = user;
        })
        .error(function(data) {
          notifier.error(data);
        });;
    }
  }
  
  //
  // Activate user account via registration link
  ctrl.activate = function() {
    if(!ctrl.token) {
      notifier.error("Invalid activation link :-(");
      return;
    }
    authService.activate(ctrl.token).success(function(data) {
        notifier.success("Great, you're ready to log in now!");
        $state.go("auth.login");
      }).error(function(data) {
        notifier.error("Something went wrong :-(");
      });

  }

  //
  // Activate user account via registration link
  ctrl.resetPassword = function() {
    if(!ctrl.token) {
      notifier.error("Invalid activation link :-(");
      return;
    }

    authService.resetPassword(ctrl.token, ctrl.user.password).success(function(data) {
        notifier.success("Great, you got a new password. You're welcome to log in now!");
        $state.go("auth.login");
      }).error(function(data) {
        notifier.error("Something went wrong :-(");
      });
  }
}