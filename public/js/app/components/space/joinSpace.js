enyine.component('joinSpace', {
  templateUrl: '/js/app/components/space/joinSpace.html',
  restrict: 'E',
  controller: ['$scope','$state','$stateParams','spaceService','notifier','$timeout', JoinSpaceController]
});

function JoinSpaceController($scope, $state, $stateParams, spaceService, notifier, $timeout) {
  var ctrl = this;

  ctrl.spaceName = $stateParams.name;
  ctrl.token = $state.params.token;

  ctrl.confirmInvitation = function(confirm) {
    if(!ctrl.token)
      return;

    spaceService.confirmJoin(ctrl.token, confirm).success(function(result) {
      notifier.success(result.message + " You will be redirected to your dashboard in very shortly.");
      $timeout(function(){
        $state.go("in.dash");
      }, 3000);

    }).error(function(err) {
      notifier.error(err.message || err.data.message);
    });
  }
}