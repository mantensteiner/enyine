enyine.component('userEditModal', {
  templateUrl: '/js/app/components/space/userEditModal.html',
  restrict: 'E',
  controller: ['$scope', 'notifier', SpaceUserEditController],
  bindings: {
    spaceId: '<',
    selectedUser: '<',
    onChangedUser: '&',
  }
});

function SpaceUserEditController($scope, notifier) {
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

  ctrl.saveUser = function() {
    ctrl.onChangedUser({user: ctrl.selectedUser});
  }

}