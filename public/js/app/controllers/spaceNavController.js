enyine.controller('SpaceNavController',
  ['$scope', '$rootScope', 'spaceService', 'userService', 'notifier',
function ($scope, $rootScope, spaceService, userService, notifier) {

    $scope.newSpace = {};
    $scope.selectedSpace = {};

    $scope.addSpace = function() {

    userService.getUser().success(function(user) {
        $scope.newSpace.users = [{
        id: user.id,
        username: user.username,
        email: user.email
        }];

        spaceService.create($scope.newSpace)
        .then(function(space) {
            $scope.newSpace = space.data;
            $rootScope.$broadcast('addedSpace', $scope.newSpace);
            $scope.newSpace = {};
            $("#addSpaceModal").modal("hide");
        }, function(err) {
            notifier.error(err.statusText);
        });
    })
    }


}]);
