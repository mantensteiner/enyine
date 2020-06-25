enyine.component('spaceDropdown', {
  templateUrl: '/js/app/components/_shared/spaceDropdown.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$q', '$state', '$stateParams', SpaceDropdownController],
  bindings: {
      spaceId: '<',
      spaceName: '<'
  }
});

function SpaceDropdownController($scope, $rootScope, $q, $state, $stateParams) {
  var ctrl = this;
  ctrl.spaceNameLimit = $rootScope.projectNameLimit;
  ctrl.xsDisplay = $rootScope.xsDisplay;
}