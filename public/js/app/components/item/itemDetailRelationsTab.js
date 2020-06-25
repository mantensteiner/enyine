enyine.component('itemDetailRelationsTab', {
  templateUrl: '/js/app/components/item/itemDetailRelationsTab.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', 'itemService', '$timeout',
               'itemTypeService', 'notifier', ItemDetailRelationsTabController],
  bindings: {
      spaceId: '<',
      activeTab: '<',
      item: '<'
  }
});


function ItemDetailRelationsTabController($scope, $rootScope, 
  itemService, $timeout, itemTypeService, notifier) {
  var ctrl = this;

  // Init
  ctrl.$onInit = function () {
    ctrl.relationsLoading = false;
    ctrl.textFilter = "";
    ctrl.itemTypeFilter = "";
    ctrl.selectedItem = null;
    ctrl.baseQuery = null;
    ctrl.thisItemQuery = null;
    ctrl.firstLoad = true;

    ctrl.relations = [];
    ctrl.take = 15;
    ctrl.skip = 0;
    ctrl.sortDir = 'desc';
    ctrl.sortBy = 'modifiedOn';
    ctrl.moreRelationsLoading = false;

    ctrl.selectedFilterItemTypes = [];
    ctrl.itemTypeFilter = "";
    ctrl.itemTypes = [];

    loadItemTypes(function(err, mkup) {
      if(err)
        return;
      ctrl.itemTypesMarkup = mkup;
    });
    
    //loadItemsAgg();  
  };

  // Detect if tab becomes active
  ctrl.$onChanges = function (changesObj) {
    if (changesObj.activeTab && changesObj.activeTab.currentValue == 'relations') {
      ctrl.relations = [];
      ctrl.firstLoad = true;
      ctrl.loadMoreRelations();
      ctrl.initRelations = true;
    }

    if(changesObj.item && changesObj.item.currentValue) {
      ctrl.baseQuery = "+(relations.id:"+ctrl.item.id+") ";
      ctrl.thisItemQuery = "+(item.id:"+ctrl.item.id+") ";
    }
  };

  ctrl.loadMoreRelations = function() {
    if(ctrl.firstLoad) {
      ctrl.firstLoad = false;
      return;
    }

    if(ctrl.activeTab && ctrl.activeTab !== 'relations')
      return;

    if(ctrl.relationsLoading || ctrl.moreRelationsLoading)
      return;

    ctrl.moreRelationsLoading = true;
    if(ctrl.relations.length > 0)
      ctrl.skip += 1;

    loadItems(true);
  }

  function setupItemTypeFilter() {
    if(ctrl.selectedFilterItemTypes.length === 0)
      return;
    ctrl.itemTypeFilter = '+(';
    _.each(ctrl.selectedFilterItemTypes, function(lf) {
      ctrl.itemTypeFilter += ' itemTypeId:'+lf.id;
    });
    ctrl.itemTypeFilter = ctrl.itemTypeFilter.trim() + ')';
  }

  ctrl.filterByItemTypes = function(el) {
    if(ctrl.selectedFilterItemTypes.length == 0) {
      ctrl.itemTypeFilter = '';
      loadItems(false);
      return;
    }
    setupItemTypeFilter();
    loadItems(false);
  }

  ctrl.buildFullItemsQuery = function() {
    var query = ctrl.baseQuery;
    if(ctrl.textFilter) {
      query += '+('+ctrl.textFilter+')';
    }
    if(ctrl.itemTypeFilter) {
        query += '+('+ctrl.itemTypeFilter+')';
    }
    if(ctrl.itemTypeFilter) {
        query += ' +('+ctrl.itemTypeFilter+')';
    }

    return query;
  }

  function loadItemsAgg() {
    ctrl.fullQuery = ctrl.buildFullItemsQuery();
    itemService.getBySpace(ctrl.spaceId, ctrl.fullQuery, null, null, null, null, null, null, {item_cnt:{value_count:{field:"id"}}, only:true})
      .then(function(itemsAgg) {
        if(itemsAgg && itemsAgg.aggs)
          ctrl.$emit('relationsCount', {relationsCount:itemsAgg.aggs.item_cnt.value});
        else
          ctrl.$emit('relationsCount', {relationsCount:0});

    });
  }

  function loadItems(loadMore) {
    if(!loadMore) {
      ctrl.relationsLoading = true;
      ctrl.relations = [];
      ctrl.skip = 0;
    }

    ctrl.fullQuery = ctrl.buildFullItemsQuery();

    itemService.getBySpace(ctrl.spaceId, ctrl.fullQuery, ctrl.take, ctrl.skip, null, null, ctrl.sortBy, ctrl.sortDir).then(function(items) {
      var correctedItems = _.map(items, function(tt){tt.date = new Date(tt.date);return tt; });

      ctrl.relations.push.apply(ctrl.relations, correctedItems);
      

      var mayHaveMoreResults = (ctrl.take * (ctrl.skip +1)) == ctrl.relations.length;

      //ctrl.$emit('relationsLoaded', {relations:ctrl.relations, mayHaveMore: mayHaveMoreResults});

      ctrl.relationsLoading = false;
      ctrl.moreRelationsLoading = false;
    });
  }

  ctrl.sort = function(field, dir) {
    if(ctrl.sortDir == 'desc' && field === ctrl.sortBy)
      ctrl.sortDir = "asc";
    else if(ctrl.sortDir == 'asc' && field === ctrl.sortBy)
      ctrl.sortDir = "desc";
    else if(field !== ctrl.sortBy && !dir)
      ctrl.sortDir = "desc";
    else
      ctrl.sortDir = dir;

    ctrl.sortBy = field;
    loadItems();
  }

  ctrl.loadItems = function() {
    ctrl.take = 10;
    loadItems(false);
  }

  ctrl.nextItemPage = function() {
    ctrl.skip += 1;
    ctrl.relations = [];
    loadItems(true);
  }

  ctrl.filterItems = function() {
    ctrl.relations = [];
    loadItems(false);
  }

  ctrl.previousItemPage = function() {
    if(ctrl.skip > 0)
      ctrl.skip -= 1;
    ctrl.relations = [];
    loadItems(true);
  }

  ctrl.getItemType = function(id) {
    return _.findWhere(ctrl.itemTypes, {id:id});
  }


  ctrl.clearItem = function(t) {
    ctrl.selectedItem = null;
    $rootScope.$broadcast('selectedItem', null);
  }

  ctrl.execFilter = function() {
    loadItems();
  }

  ctrl.removeRelation = function(t) {
    if(confirm("Really remove relation?")) {
      var targetQuery = "+(item.id:" + ctrl.item.id + ")";
      var sourceQuery = "+(item.id:" + t.id + ")";
      itemService.removeRelations(ctrl.spaceId, targetQuery, sourceQuery).then(
        function() {
          ctrl.relations = _.without(ctrl.relations, _.findWhere(ctrl.relations, {id:t.id}));
          $timeout(function(){
            loadItemsAgg();
          },1500);
          notifier.success("Removed relation to " + t.name + ".");
      }, function(err) {
        notifier.error(err.message);
      });
    }
  }

  function loadItemTypes(cb) {
    ctrl.itemTypesLoading = true;
    ctrl.itemTypes = [];
    var skip = 0;
    var take = 10000;

    itemTypeService.getBySpace(ctrl.spaceId, '*', take, skip).then(function(itemTypes) {
      ctrl.itemTypes = itemTypes;
      ctrl.itemTypesLoading = false;

      cb(null,  itemTypeService.buildMarkup(ctrl.itemTypes));
    }, function(err) {
      notifier.error(err.message);
      cb(err.message);
    });
  }
}