enyine.component('itemDetailActivityTab', {
  templateUrl: '/js/app/components/item/itemDetailActivityTab.html',
  restrict: 'E',
  controller: ['$scope', 'spaceService', 'notifier', '$timeout', ItemDetailActivityTabController],
  bindings: {
      spaceId: '<',
      activeTab: '<',
      item: '<'
  }
});


function ItemDetailActivityTabController($scope, spaceService, notifier, $timeout) {
  var ctrl = this;

  // Init
  ctrl.$onInit = function () {
    ctrl.take = 30;
    ctrl.skip = 0;
    ctrl.textFilter = "";
    ctrl.moreActionsLoading = false;
    ctrl.actions = [];
  };

  // Detect if tab becomes active
  ctrl.$onChanges = function (changesObj) {
    if (changesObj.activeTab && changesObj.activeTab.currentValue == 'activity') {
      ctrl.loadMoreActions();
    }
  };

  ctrl.execFilter = function() {
    loadActions();
  }

  ctrl.loadMoreActions = function() {
    if(ctrl.moreActionsLoading)
      return;

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

    var query = '+(recordId:' + ctrl.item.id + ')';
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