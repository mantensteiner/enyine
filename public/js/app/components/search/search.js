enyine.component('search', {
  templateUrl: '/js/app/components/search/search.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$state', '$stateParams', 'notifier', 'userService', 'spaceService',
               GlobalSearchController]
});

function GlobalSearchController($scope, $rootScope, $state, $stateParams, notifier, userService, spaceService) {
    var ctrl = this;

    ctrl.term = $stateParams.term ? $stateParams.term : '*';
    ctrl.loading = false;
    ctrl.loadingMore = false;
    ctrl.searchResults = [];
    ctrl.take = 20;
    ctrl.skip = 0;

    ctrl.search = function() {
    $state.go("in.search", {term: ctrl.term});
    }

    function search(loadMore) {
    if(!loadMore) {
        ctrl.loading = true;
        ctrl.searchResults = [];
        ctrl.skip = 0;
    }

    userService.searchGlobal(ctrl.term, ctrl.take, ctrl.skip).then(function(results) {
        ctrl.searchResults.push.apply(ctrl.searchResults, results);
        ctrl.loading = false;
        ctrl.loadingMore = false;
    }, function(err) {
        notifier.error(err.message);
    });
    }      
        
    ctrl.loadMore = function() {
    if(ctrl.loadingMore)
        return;

    ctrl.loadingMore = true;
    if(ctrl.searchResults.length > 0)
        ctrl.skip += 1;
    search(true);
    }

    loadProjects();
    function loadProjects() {
    ctrl.loading = true;
    spaceService.get().then(function(spaces) {
        ctrl.spaces = spaces.data;
        search();
    });
    }

    ctrl.getProjectName = function(pId) {
    var res =_.findWhere(ctrl.spaces, {id:pId});
    if(!res)
        return 'not_found';
    return res.name;
    }
}