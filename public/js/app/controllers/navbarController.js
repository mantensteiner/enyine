enyine.controller('NavbarController',
        ['$scope', '$rootScope', '$state', '$stateParams', 'userService', 'spaceService', 'notifier', '$timeout', 'authService',
function ($scope, $rootScope, $state, $stateParams, userService, spaceService, notifier, $timeout, authService) {


(function($) {
    $(document).ready(function() {
      //$.slidebars();
    });
}) (jQuery);

  $scope.spaces = [];
  $scope.spaceId = $stateParams.id;
  $scope.selectedSpace = null;
  
  init();
  function init() {
    if(!authService.isAnonymousRoute($state.current.name)) {
      loadUser();
      loadSpaces();
    }
  }
  
  
  function loadSpaces() {
    spaceService.get().success(function(spaces) {
      $scope.spaces = spaces;

      if($state.current.name == "in.space") {
        var idParam = $stateParams.id;
        var p = _.findWhere($scope.spaces, {_id: idParam});
        if(p)
          $scope.selectedSpace = p;
      }
    }).error(function(err) {
      console.log(err.message)
      //notifier.error(err.message);
    });
  }
  
  function loadUser() {
    userService.getUser().then(function(user) {
      if(user.data)
        user = user.data;

      $scope.user = user;
    }, function(err) {
      console.log(err);
    });  
  }

  $scope.selectSpace = function(space) {
    $scope.selectedSpace = space;

    if(space) {
      $state.go('in.items', {id:space.id,view:'items',listMode:'list', filter:'', filterQuery: ''});
    }
  }

  //
  // Event - Add new space
  $rootScope.$on('addNewSpace', function (event, data) {
    $("#addSpaceModal").modal('show');
  });


  //
  // Event - Space Selected, reload space data
  $scope.$on('selectedSpace', function (event, data) {
    $scope.selectSpace(data);
  });

  //
  // Event - Space added, reload spaces
  $scope.addedSpace = function() {
    loadSpaces();
  };

  //
  // Event - Space added, reload spaces
  $scope.$on('deletedSpace', function (event, data) {
    $scope.spaces = _.without($scope.spaces, _.findWhere($scope.spaces, {_id: data.id}));
  });

  //
  // Event - New Bookmark
  $scope.$on('addBookmark', function (event, data) {
    var link = data.link;
    var displayName = data.name;
    var space = _.findWhere($scope.spaces, {_id:data.spaceId});
    var spaceName = space ? space._source.name : '?';

    var bookmark = {
      name: spaceName + ", " + displayName,
      link:data.url,
      date: new Date()
    };

    if(!$scope.user.bookmarks)
      $scope.user.bookmarks = [];

    $scope.user.bookmarks.push(bookmark);
    userService.save($scope.user).then(
      function() {
        notifier.success("Saved bookmark!")
      },
      function(err){
        notifier.error("Bookmarks could not be saved.")
      });
  });

  $scope.selectBookmark = function(bm) {
    $rootScope.$broadcast('editBookmark', {bm:bm,user:$scope.user});
  }

  $scope.deleteBookmark = function(bm) {
    $scope.user.bookmarks = _.without($scope.user.bookmarks, bm);
    userService.save($scope.user).then(
      function() {
        notifier.success("Removed bookmark!")
      },
      function(err){
        notifier.error("Bookmarks could not be removed.")
      });
  }

  $scope.searchTerm = '';
  $scope.search = function() {
    $state.go('in.search', {term:$scope.searchTerm})
  }

  $scope.getClass = function(path) {
    if($state.current.name.indexOf(path) === 0) {
      return true;
    }
    else {
      return false;
    }
  }
}]);


enyine.controller('BookmarkModalController',
  ['$scope', '$rootScope', 'userService', 'notifier',
    function ($scope, $rootScope, userService, notifier) {

      $scope.$on('editBookmark', function(sc, data) {
        $scope.user = data.user;
        $scope.selectedBookmark = data.bm;
      });

      $scope.updateBookmark = function() {
        userService.save($scope.user).then(
          function() {
            notifier.success("Updated bookmark!")
          },
          function(err){
            notifier.error("Bookmarks could not be saved.")
          });
        $("#updateBookmarkModal").modal('hide');
      }

    }]);
