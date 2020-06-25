enyine.component('signup', {
  templateUrl: '/js/app/components/auth/signup.html',
  restrict: 'E',
  controller: ['$scope', 'authService','notifier', SignupController]
});

function SignupController($scope, authService, notifier) {
  var ctrl = this;
  ctrl.termsAccepted = false;
  ctrl.user = {
    username: '',
    password: ''
  }

  ctrl.passwordValid = function() {
    return ctrl.user.passwordCheck === ctrl.user.password;
  }

  //
  // Submit signup
  ctrl.submitSignup = function() {

    delete ctrl.user.passwordCheck;

    authService.createUser(ctrl.user)
      .success(function(data) {
        notifier.success("We sent you an email with an activation link, please check your inbox!", true);
      }).error(function(data) {
        notifier.error(data);
      });
  }
}