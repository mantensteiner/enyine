enyine.component('itemTypeList', {
  templateUrl: '/js/app/components/itemtype/itemTypeList.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$state', '$stateParams', '$q', 'spaceService', 'itemTypeService', 
               '$timeout', 'notifier', ItemTypeListController]
});

function ItemTypeListController($scope, $rootScope, $state, $stateParams, $q, spaceService, itemTypeService, 
  $timeout, notifier) {
  var ctrl = this;

  ctrl.spaceId = $stateParams.id;
  ctrl.space = null;
  ctrl.spaceLoading = false;
  ctrl.itemTypesLoading = false;
  ctrl.textFilter = "";
  ctrl.selectedItemType = null;

  function loadSpace() {
    ctrl.spaceLoading = true;
    var defer = $q.defer();

    spaceService.getById(ctrl.spaceId).success(function(p) {
      ctrl.space = p;
      ctrl.spaceName = p.name;
      ctrl.spaceLoading = false;
      defer.resolve(ctrl.space);
    });

    return defer.promise;
  }
  loadSpace();
  loadItemTypes(false);

  ctrl.itemTypes = [];
  ctrl.take = 20;
  ctrl.skip = 0;
  ctrl.moreItemTypesLoading = false;
  ctrl.loadMoreItemTypes = function() {
    if(ctrl.moreItemTypesLoading)
      return;

    ctrl.moreItemTypesLoading = true;
    if(ctrl.itemTypes.length > 0)
      ctrl.skip += 1;
    loadItemTypes(true);
  }


  function loadItemTypes(loadMore) {
    if(!loadMore) {
      ctrl.itemTypesLoading = true;
      ctrl.itemTypes = [];
      ctrl.skip = 0;
    }

    var query = null;
    if(ctrl.textFilter) {
      query = ctrl.textFilter;
    }

    itemTypeService.getBySpace(ctrl.spaceId, query, ctrl.take, ctrl.skip).then(function(itemTypes) {
      ctrl.itemTypes.push.apply(ctrl.itemTypes, itemTypes);
      ctrl.itemTypesLoading = false;
      ctrl.moreItemTypesLoading = false;
    });
  }
  ctrl.loadItemTypes = function() {
    ctrl.take = 10;
    loadItemTypes(false);
  }
  ctrl.nextItemTypePage = function() {
    ctrl.skip += 1;
    ctrl.itemTypes = [];
    loadItemTypes(true);
  }
  ctrl.filterItemTypes = function() {
    ctrl.itemTypes = [];
    loadItemTypes(false);
  }

  ctrl.previousItemTypePage = function() {
    if(ctrl.skip > 0)
      ctrl.skip -= 1;
    ctrl.itemTypes = [];
    loadItemTypes(true);
  }

  ctrl.viewLoading = function() {
    if(ctrl.spaceLoading)
      return true;

    return false;
  }

  ctrl.selectItemType = function(l) {
    if(!l) {
      ctrl.selectedItemType = {
        color: '#000000',
        icon: 'fa fa-square'
      }
    }
    else {
      ctrl.selectedItemType = l;
    }
    $scope.$broadcast('selectedItemType', {itemType: ctrl.selectedItemType, spaceId: ctrl.spaceId});
  }

  ctrl.execFilter = function() {
    loadItemTypes();
  } 
}