enyine.component('navbar', {
  templateUrl: '/js/app/components/navbar/navbar.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$state', '$stateParams', 'userService', 'spaceService', 
               'notifier', '$timeout', 'authService', NavbarController]
});

function NavbarController($scope, $rootScope, $state, $stateParams, userService, spaceService, 
    notifier, $timeout, authService) {
    var ctrl = this;

    (function($) {
        $(document).ready(function() {
        //$.slidebars();
        });
    }) (jQuery);

    ctrl.spaces = [];
    ctrl.spaceId = $stateParams.id;
    ctrl.selectedSpace = null;

    init();
    function init() {
        if(!authService.isAnonymousRoute($state.current.name)) {
        loadUser();
        loadSpaces();
        }
    }


    function loadSpaces() {
        spaceService.get().success(function(spaces) {
        ctrl.spaces = spaces;

        if($state.current.name == "in.space") {
            var idParam = $stateParams.id;
            var p = _.findWhere(ctrl.spaces, {_id: idParam});
            if(p)
            ctrl.selectedSpace = p;
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

        ctrl.user = user;
        }, function(err) {
        console.log(err);
        });  
    }

    ctrl.selectSpace = function(space) {
        ctrl.selectedSpace = space;

        if(space) {
            $state.go('in.items', {id:space.id,view:'items',listMode:'list', filter: '', filterQuery: ''});
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
        ctrl.selectSpace(data);
    });

    //
    // Event - Space added, reload spaces
    $scope.$on('addedSpace', function (event, data) {
        ctrl.spaces.push(data);
    });

    //
    // Event - Space added, reload spaces
    $scope.$on('deletedSpace', function (event, data) {
        ctrl.spaces = _.without(ctrl.spaces, _.findWhere(ctrl.spaces, {_id: data.id}));
    });

    //
    // Event - New Bookmark
    $scope.$on('addBookmark', function (event, data) {
        var link = data.link;
        var displayName = data.name;
        var space = _.findWhere(ctrl.spaces, {_id:data.spaceId});
        var spaceName = space ? space._source.name : '?';

        var bookmark = {
            name: spaceName + ", " + displayName,
            link:data.url,
            date: new Date()
        };

        if(!ctrl.user.bookmarks) {
            ctrl.user.bookmarks = [];
        }

        ctrl.user.bookmarks.push(bookmark);
        userService.save(ctrl.user)
        .then(
            function() {
                notifier.success("Saved bookmark!")
            },
            function(err){
                notifier.error("Bookmarks could not be saved.")
        });
    });

    ctrl.selectBookmark = function(bm) {
        $rootScope.$broadcast('editBookmark', {bm:bm,user:ctrl.user});
    }

    ctrl.deleteBookmark = function(bm) {
        ctrl.user.bookmarks = _.without(ctrl.user.bookmarks, bm);
        userService.save(ctrl.user).then(
        function() {
            notifier.success("Removed bookmark!")
        },
        function(err){
            notifier.error("Bookmarks could not be removed.")
        });
    }

    ctrl.searchTerm = '';
    ctrl.search = function() {
        $state.go('in.search', {term:ctrl.searchTerm})
    }

    ctrl.getClass = function(path) {
        if($state.current.name.indexOf(path) === 0) {
        return true;
        }
        else {
        return false;
        }
    } 
}