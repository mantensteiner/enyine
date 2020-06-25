enyine.component('itemList', {
  templateUrl: '/js/app/components/item/itemList.html',
  restrict: 'E',
  controller: ['$state', '$stateParams', 'spaceService', 'itemService', '$timeout', 'valueService',
    'itemTypeService', 'notifier', 'filterService', '$location', 'queryCacheService', 'utilityService', ItemListController]
});

function ItemListController($state, $stateParams, spaceService, itemService, $timeout, valueService,
  itemTypeService, notifier, filterService, $location, queryCacheService, utilityService) {
  var ctrl = this;

  this.$onInit = function() {
    ctrl.spaceId = $stateParams.id;
    ctrl.filterId = $stateParams.filter;
    ctrl.filterQuery = $stateParams.filterQuery;
    ctrl.displayMode = $stateParams.listMode ? $stateParams.listMode : 'list';
    ctrl.space = null;
    ctrl.spaceLoading = false;
    ctrl.itemsLoading = false;
    ctrl.textFilter = "";
    ctrl.itemTypeFilter = "";
    ctrl.itemStatus = [];
    ctrl.selectedItem = null;
    ctrl.selectedFilterItemTypes = [];
    ctrl.selectedFilterItemTypeIds = [];
    ctrl.items = [];
    ctrl.take = 15;
    ctrl.skip = 0;
    ctrl.sortDir = 'desc';
    ctrl.sortBy = 'modifiedOn';
    ctrl.moreItemsLoading = false;
    ctrl.itemTypes = [];
    ctrl.filters = [];
    ctrl.selectedFilter = null;

    loadSpace();
    loadStatus();
    ctrl.loadMoreItems();

    loadItemTypes(function(err, mkup) {
      if(err)
        return;
      ctrl.itemTypesMarkup = mkup;
    });

    loadItemTypes(function(err, mkup) {
      if(err)
        return;
      ctrl.newItemItemTypesMarkup = mkup;
    });
  };

  function loadSpace() {
    ctrl.spaceLoading = true;

    spaceService.getById(ctrl.spaceId)
      .then(function(p) {
        ctrl.space = p.data;
        ctrl.spaceName = p.data.name;
        ctrl.spaceLoading = false;
      }, function(err) {
        notifier.error("Could not load space.");
      });
  }

  function loadStatus() {
    spaceService.getStatus(ctrl.spaceId)
      .then(function(status) {
        ctrl.itemStatus = status.data;
      }, function(err) {
        notifier.error("Could not load status.");
      });
  }

  function setupItemTypeFilter() {
    if(ctrl.selectedFilterItemTypes.length === 0)
      return;
    ctrl.itemTypeFilter = '+(';
    _.each(ctrl.selectedFilterItemTypes, function(lf) {
      ctrl.itemTypeFilter += 'itemTypeId:'+lf.id + ' ';
    });
    ctrl.itemTypeFilter = ctrl.itemTypeFilter.trim() + ')';
  }

  function loadItems(loadMore) {
    if(!loadMore) {
      ctrl.itemsLoading = true;
      ctrl.items = [];
      ctrl.skip = 0;
    }

    ctrl.fullQuery = ctrl.buildFullItemsQuery();
    
    // set query cache for paging in detail
    queryCacheService.setItemsQuery(ctrl.fullQuery);

    itemService.getBySpace(ctrl.spaceId, ctrl.fullQuery, ctrl.take, ctrl.skip, null, null, 
      ctrl.sortBy, ctrl.sortDir, null, true)
      .then(function(items) {
        ctrl.itemsTotal = items.total;
        ctrl.items.push.apply(ctrl.items, items.hits);
        ctrl.itemsLoading = false;
        ctrl.moreItemsLoading = false;
      }, function(err) {
        ctrl.itemsLoading = false;
        ctrl.moreItemsLoading = false;
        notifier.error("Could not load items");
      });
  }

  function buildTextFilterQuery() {
    var selectedFilterText = '';
    if(ctrl.selectedFilter) {
          selectedFilterText = ctrl.selectedFilter.filter.text;
    }
    return ctrl.textFilter
      .replace(selectedFilterText, '')
      .replace('+()', '')
      .trim();
  }

  function addItemTypeFilterQueryPart(queryString) {
    queryString = '+(' + queryString + ')';
    if(ctrl.itemTypeFilter) {
      if(!queryString)
        queryString = '+('+ctrl.itemTypeFilter+')';
      else
        queryString += ' +('+ctrl.itemTypeFilter+')';
    }

    return queryString;
  }

  function formatQueryString(queryString) {
      return queryString.replace(/\+\(\+\(/g, '\+\(').replace(/\)\)/g, '\)')
        .replace(/\+\(\)/g, '');
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

  function loadFilters(cb) {
    loadItemTypes(function(err, mkup) {
      if(err)
        return;
      ctrl.filterItemTypesMarkup = mkup;

      filterService.getBySpace(ctrl.spaceId, "*").then(
        function(data) {
          ctrl.filters = data;
          if(ctrl.filterId) {
            ctrl.selectedFilter = _.findWhere(ctrl.filters, {id:ctrl.filterId});
            if(ctrl.selectedFilter) {
              ctrl.selectedFilterQuery = ctrl.selectedFilter.filter.text;
              if( ctrl.selectedFilter.filter.itemTypes.length > 0) {
                _.each(ctrl.filterItemTypesMarkup, function(lm) {
                  if(_.findWhere(ctrl.selectedFilter.filter.itemTypes, lm.id)) {
                    var itemType = _.findWhere(ctrl.itemTypes, {id:lm.id});
                    if(itemType) {
                      ctrl.selectedFilterItemTypes.push(itemType);
                      ctrl.selectedFilterItemTypeIds = _.map(ctrl.selectedFilterItemTypes, function(fl) { return fl.id; });
                    }
                    lm.ticked = true;
                  }
                  else
                    lm.ticked = false;
                });
              }
              setupItemTypeFilter();
            }
          }


          /*if(ctrl.filterQuery) {
            if(ctrl.filterQuery.indexOf('+(') === 0) {
              ctrl.filterQuery = ctrl.filterQuery.substring(2, ctrl.filterQuery.length-1);
            }

            ctrl.textFilter = '+('+ctrl.textFilter+') +('+ ctrl.filterQuery + ')';
          }*/

          ctrl.textFilter = ctrl.filterQuery;

          cb();
        },
        function(err) {
          notifier.error(err.message);
        });
    });
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

  ctrl.loadMoreItems = function(q) {
    ctrl.query = "+(" + q + ") +(" + ctrl.query + ")";

    if(ctrl.moreItemsLoading)
      return;

    ctrl.moreItemsLoading = true;
    if(ctrl.items.length > 0)
      ctrl.skip += 1;
    if(ctrl.filters.length === 0) {
      loadFilters(function() {
        loadItems(true);
      });
    }
    else {
      loadItems(true);
    }
  }

  ctrl.buildFullItemsQuery = function() {
    var query = null;
    if(ctrl.textFilter) {
      query = '+('+ctrl.textFilter+')';
    }
    if(ctrl.selectedFilterQuery) {
      if(!query)
        query = '+('+ctrl.selectedFilterQuery+')';
      else
        query += ' +('+ctrl.selectedFilterQuery+')';
    }
    if(ctrl.itemTypeFilter) {
      if(!query)
        query = '+('+ctrl.itemTypeFilter+')';
      else
        query += ' +('+ctrl.itemTypeFilter+')';
    }

    return query;
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
    ctrl.items = [];
    loadItems(true);
  }

  ctrl.filterItems = function() {
    ctrl.items = [];
    loadItems(false);
  }

  ctrl.changeListMode = function(mode) {
    ctrl.displayMode = mode;
    ctrl.execFilter();
  }

  ctrl.switchList = function(l) {
    $stateParams.listMode = l;
    //$state.go('items', {'id:':ctrl.spaceId, 'listMode': l, 'view': 'items'});
  }

  ctrl.previousItemPage = function() {
    if(ctrl.skip > 0)
      ctrl.skip -= 1;
    ctrl.items = [];
    loadItems(true);
  }

  ctrl.viewLoading = function() {
    if(ctrl.spaceLoading)
      return true;

    return false;
  }

  ctrl.setMood = function(e) {
    if(!ctrl.selectedItem)
      ctrl.selectedItem = {};
    ctrl.selectedItem.mood = e;
    ctrl.changeMood = false;
  }

  ctrl.getItemType = function(id) {
    return _.findWhere(ctrl.itemTypes, {id:id});
  }

  ctrl.clearItem = function(t) {
    ctrl.selectedItem = null;
  }

  ctrl.itemCreated = function() {
    loadItems(false);
  }

  ctrl.execFilter = function() {
    var queryString = formatQueryString(addItemTypeFilterQueryPart(buildTextFilterQuery()));

    $state.go('in.items', {id:ctrl.spaceId, listMode: ctrl.displayMode,
      filter: ctrl.filterId, filterQuery: queryString}, {notify: false});

    loadItems(false);
  }

  ctrl.filteredItems = function(statusId) {
    return _.filter(ctrl.items,function(f) {
      if(!f.status) {
        return false;
      }
      if(f.status.id === statusId)
        return true;
      return false;
    });
  }

  ctrl.filterSaved = function() {    
  }

  ctrl.clearFilters = function() {
    $state.go('in.items', {id:ctrl.spaceId, listMode: '', filter: '', filterQuery: ''}, {notify:false});
    
    ctrl.textFilter = "";
    ctrl.itemTypeFilter = "";
    loadItems(false);
  }

  ctrl.initFilterModal = function() {
    ctrl.filterModalConfig = { timestamp: new Date() };
  }
}