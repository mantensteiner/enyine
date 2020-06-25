enyine.component('spaceSettings', {
  templateUrl: '/js/app/components/space/settings.html',
  restrict: 'E',
  controller: ['$state','$stateParams','spaceService', '$timeout', 'notifier', SpaceSettingsController]
});

function SpaceSettingsController($state, $stateParams, spaceService, $timeout, notifier) {
  var ctrl = this;

  ctrl.$onInit = function () {
    ctrl.spaceId = $stateParams.id;
    ctrl.space = null;
    ctrl.spaceLoading = false;
    ctrl.token = $state.params.token;
    
    // selected user for user-modal components
    ctrl.selectedUser = null;
    // object for child component-modals to watch for changes
    ctrl.selectedUserChanged = null;

    ctrl.activeTab = 'general';
    loadSpace();
  };

  function loadSpace() {
    ctrl.spaceLoading = true;

    if(ctrl.spaceId) {
      spaceService.getById(ctrl.spaceId).success(function(p) {
        ctrl.space = p;
        ctrl.spaceLoading = false;
      }).error(function(err) {
        notifier.error(err.message || err.data.message);
      });
    }
    else if(ctrl.token) {
      spaceService.getByInvitationToken(ctrl.token).success(function(p) {
        ctrl.space = p;
        ctrl.spaceLoading = false;
      }).error(function(err) {
        notifier.error(err.message || err.data.message);
      });
    }
  }

  ctrl.switchTabs = function(tabName) {
    ctrl.activeTab = tabName;
  }

  ctrl.viewLoading = function() {
    if(ctrl.spaceLoading)
      return true;

    return false;
  }

  ctrl.deleteSpace = function(space) {
    ctrl.spaceLoading = true;
    
    spaceService.delete(space.id).then(function() {
      $("#deleteSpaceModal").modal('hide');

      $timeout(function() {
        $state.go("in.dashboard");
      }, 1000);
    }, function(err) {
      notifier.error(err.message || err.data.message);
    });
  }

  // User selection changed callback
  ctrl.changedUserSelection = function(user) {
    ctrl.selectedUser = user;
  }

  // Modified or deleted user
  ctrl.onUserChanged = function(user) {
    ctrl.selectedUserChanged = user;
  }
}