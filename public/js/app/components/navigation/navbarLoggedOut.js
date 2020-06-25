enyine.component('navbarLoggedOut', {
  templateUrl: '/js/app/components/navbar/navbarLoggedOut.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$state', '$stateParams', NavbarLoggedOutController]
});

function NavbarLoggedOutController($scope, $rootScope, $state, $stateParams) {
    var ctrl = this;

}