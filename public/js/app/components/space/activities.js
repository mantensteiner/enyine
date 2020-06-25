enyine.component('spaceActivities', {
  templateUrl: '/js/app/components/space/activities.html',
  restrict: 'E',
  controller: ['$scope','spaceService','notifier', SpaceActivitiesController],
  bindings: {
    spaceId: '<',
    activeTab: '<'
  }  
});

function SpaceActivitiesController($scope, spaceService, notifier) {
  var ctrl = this;

  // Init
  ctrl.$onInit = function () {
    ctrl.actions = [];
    ctrl.loadingActions = false;
    ctrl.take = 30;
    ctrl.skip = 0;
    ctrl.textFilter = "";
    ctrl.moreActionsLoading = false;
  };

  // Detect if tab becomes active
  ctrl.$onChanges = function (changesObj) {
    if (changesObj.activeTab && changesObj.activeTab.currentValue == 'activity') {
        // load activities
        loadActions(false);
    }
  };

  ctrl.execFilter = function() {
    loadActions();
  }
  ctrl.loadMoreActions = function() {
    ctrl.moreActionsLoading = true;
    if(ctrl.actions.length > 0)
      ctrl.skip += 1;
    loadActions(true);
  }

  function loadActions(loadMore) {
    if(!loadMore) {
      ctrl.loadingActions = true;
      ctrl.actions = [];
      ctrl.skip = 0;
    }

    var query = null;
    if(ctrl.textFilter) {
      query = ctrl.textFilter;
    }

    ctrl.loadingActions = true;
    spaceService.getActions(ctrl.spaceId, query, ctrl.take, ctrl.skip).then(function(actions) {
      ctrl.actions.push.apply(ctrl.actions, actions);
      ctrl.loadingActions = false;
      ctrl.moreActionsLoading = false;
    }, function(err) {
      notifier.error(err.message || err.data.message);
    });
  }
  
}