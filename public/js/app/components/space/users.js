enyine.component('spaceUsers', {
  templateUrl: '/js/app/components/space/users.html',
  restrict: 'E',
  controller: ['$scope','$state', 'spaceService', 'userService', 'notifier', SpaceUsersController],
  bindings: {
    spaceId: '<',
    activeTab: '<',
    users: '<',
    onUserSelected: '&',
    usersChanged: '<'
  }
});

function SpaceUsersController($scope, $state, spaceService, userService, notifier) {
  var ctrl = this;

  // Init
  ctrl.$onInit = function () {
    ctrl.lookupUser = false;
    ctrl.validUserFound = false;
    ctrl.findUserInput = null;
    ctrl.validUser =  null;
    ctrl.selectedUser = null;
  };

  // Detect if tab becomes active
  ctrl.$onChanges = function (changesObj) {
    if (changesObj.activeTab && changesObj.activeTab.currentValue == 'users') {
        // load users
    }

    // user info changed - reload list
    if (changesObj.usersChanged && changesObj.usersChanged.currentValue) {
      console.log('reload users')
    }
  };

   ctrl.findUser = function() {
    ctrl.invitationSent = false;
    spaceService.searchUser(ctrl.findUserInput, ctrl.spaceId).success(function(user) {
      if(user.found) {
        ctrl.validUserFound = true;
        ctrl.validUser = user.username;
      }

      else
        ctrl.validUserFound = false;
    }).error(function(err) {
      notifier.error(err.message || err.data.message);
    });
  }

  ctrl.selectUser = function(user) {
    ctrl.selectedUser = user;
    ctrl.onUserSelected({user: user});
  }

  ctrl.sendInvite = function() {
    if(!ctrl.validUserFound) {
      console.error("no valid username");
      return;
    };

    userService.getUser()
      .then(function(user) {
        spaceService.inviteUser(ctrl.validUser, ctrl.spaceId, user.data.username).success(function(user) {
          notifier.success("Invitation to join the Space was sent to " + user.email);
          ctrl.invitationSent = true;
        });
      }, function(err) {
        notifier.error(err.message || err.data.message);
        ctrl.invitationSent = false;
      });
  }


  ctrl.confirmInvitation = function(confirm) {
    if(!ctrl.token)
      return;

    spaceService.confirmJoin(ctrl.token, confirm).success(function(result) {
      notifier.success(result.message);
      $state.go("in.dashboard");
    }).error(function(err) {
      notifier.error(err.message || err.data.message);
    });
  } 
}