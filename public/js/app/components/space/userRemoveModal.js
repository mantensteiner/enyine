enyine.component('userRemoveModal', {
  templateUrl: '/js/app/components/space/userRemoveModal.html',
  restrict: 'E',
  controller: ['$scope', 'spaceService', 'notifier', SpaceUserRemoveController],
  bindings: {
    spaceId: '<',
    selectedUser: '<',
    projectName: '<',
    onRemovedUser: '&'
  }
});

function SpaceUserRemoveController($scope, spaceService, notifier) {
  var ctrl = this;

  // Init
  ctrl.$onInit = function () {
    ctrl.selectedUser = null;
  };

  ctrl.$onChanges = function (changesObj) {
    // selected user changed
    if (changesObj.selectedUser && changesObj.selectedUser.currentValue) {
      ctrl.selectedUser = changesObj.selectedUser.currentValue;
    }
  };

  ctrl.removeUser = function(user) {
    spaceService.removeUser(ctrl.spaceId, user.id).success(function() {
      ctrl.onRemovedUser({user:user});
    }).error(function(err) {
      notifier.error(err.message || err.data.message);
    });
  }
  
}