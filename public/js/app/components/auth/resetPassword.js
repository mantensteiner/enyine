enyine.component('resetPassword', {
  templateUrl: '/js/app/components/auth/resetPassword.html',
  restrict: 'E',
  controller: ['$scope','$state', '$stateParams', 'authService', 'userService','notifier', PasswordResetController]
});

function PasswordResetController($scope, $state, $stateParams, authService, userService, notifier) {
  var ctrl = this;

  ctrl.user = {
    username: '',
    password: ''
  }

  //
  // Password reset - provide email for activation link
  ctrl.reset = function() {
    authService.reset(ctrl.user.email).success(function(data) {
        notifier.success("We sent your an email with a reset link, please check your inbox!", true);
      }).error(function(data) {
        notifier.error("Something went wrong.");
      });
  }
}