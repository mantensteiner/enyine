enyine.component('logout', {
  restrict: 'E',
  templateUrl: '/js/app/components/auth/logout.html',
  controller: ['$state', 'authService', LogoutController]
});

function LogoutController($state, authService) {
  var ctrl = this;
  authService.logout(function() {
    $state.go('off.home');
  });
}