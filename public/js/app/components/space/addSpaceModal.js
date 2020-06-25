enyine.component('addSpaceModal', {
  templateUrl: '/js/app/components/space/addSpaceModal.html',
  restrict: 'E',
  controller: ['userService', 'spaceService', 'notifier', AddSpaceModalController],
  bindings: {
    onSaved: '&'
  }
});

function AddSpaceModalController(userService, spaceService, notifier) {
  var ctrl = this;

  // Init
  ctrl.$onInit = function () {
    ctrl.newSpace = {};
  };


  ctrl.addSpace = function() {
    userService.getUser().success(function(user) {
        ctrl.newSpace.users = [{
          id: user.id,
          username: user.username,
          email: user.email
        }];

        spaceService.create(ctrl.newSpace)
        .then(function(space) {
            $("#addSpaceModal").modal("hide");
            ctrl.onSaved();
        }, function(err) {
            notifier.error(err.statusText);
        });
    })
  }
}