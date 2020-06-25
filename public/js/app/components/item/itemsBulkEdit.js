enyine.component('itemsBulkEdit', {
  templateUrl: '/js/app/components/item/itemsBulkEdit.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$state', '$stateParams', '$q', 'spaceService', 'itemService', '$timeout',
    'itemTypeService', 'notifier', 'filterService', '$location', 'tagService', ItemsBulkEditController]
});

function ItemsBulkEditController($scope, $rootScope, $state, $stateParams, $q, spaceService, itemService, $timeout,
    itemTypeService, notifier, filterService, $location, tagService) {
    var ctrl = this;

    ctrl.spaceId = $stateParams.id;
    ctrl.targetQuery = $stateParams.targetQuery;
    ctrl.targetInfo = $stateParams.targetInfo;
    ctrl.filterId = "";
    ctrl.filterQuery = "";
    ctrl.space = null;
    ctrl.spaceLoading = false;
    ctrl.itemsLoading = false;
    ctrl.textFilter = "";
    ctrl.itemTypeFilter = "";
    ctrl.itemStatus = [];
    ctrl.selectedItem = null;
    ctrl.selectedTime = null;
    ctrl.firstLoad = true;

    ctrl.targetQueryDisplay = ctrl.targetQuery.replace(/\(/g, '').replace(/\)/g, '').replace(/\+\+/g,'+');

    function loadProject() {
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
    loadProject();

    function loadStatus() {
    spaceService.getStatus(ctrl.spaceId).success(function(status) {
        ctrl.itemStatus = status;
    });
    }
    loadStatus();


    ctrl.items = [];
    ctrl.take = 15;
    ctrl.skip = 0;
    ctrl.sortDir = 'desc';
    ctrl.sortBy = 'modifiedOn';
    ctrl.moreItemsLoading = false;
    ctrl.loadMoreItems = function() {
    if(ctrl.moreItemsLoading)
        return;

    if(ctrl.firstLoad) {
        ctrl.firstLoad = false;
        loadFilters();
        return;
    }

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

    if(ctrl.excludedItems && ctrl.excludedItems.length > 0) {
        query += "+(";
        _.each(ctrl.excludedItems, function(et) {
        query += "+(!item.id:" + et.id + ")";
        })
        query += ")";
    }

    return query;
    }

    function loadItems(loadMore) {
    if(!loadMore) {
        ctrl.itemsLoading = true;
        ctrl.items = [];
        ctrl.skip = 0;
    }

    ctrl.fullQuery = ctrl.buildFullItemsQuery();

    itemService.getBySpace(ctrl.spaceId, ctrl.fullQuery, ctrl.take, ctrl.skip, null, null, ctrl.sortBy, ctrl.sortDir,
        null, true).then(function(items) {
        ctrl.itemsTotal = items.total;
        ctrl.items.push.apply(ctrl.items, items.hits);
        ctrl.itemsLoading = false;
        ctrl.moreItemsLoading = false;

        if(ctrl.displayMode === 'masterDetail' && ctrl.items.length > 0)
        ctrl.editItem(ctrl.items[0]);

        $scope.$emit('itemsLoaded', ctrl.items);
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
    ctrl.items = [];
    loadItems(true);
    }
    ctrl.filterItems = function() {
    ctrl.items = [];
    loadItems(false);
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


    ctrl.excludedItems = [];
    ctrl.excludeItem = function(t) {
    var i = _.indexOf(ctrl.items, t);
    if(i !== -1) {
        ctrl.excludedItems.push(t);
        ctrl.items.splice(i, 1);
    }
    }
    ctrl.resetExcludedItems = function() {
    ctrl.excludedItems = [];
    ctrl.showExcluded = false;
    }


    ctrl.getItemType = function(id) {
    return _.findWhere(ctrl.itemTypes, {id:id});
    }

    ctrl.selectedFilterItemTypes = [];
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

    ctrl.filterItem = function(t) {
    $scope.$emit('filterItem', t);
    }

    ctrl.clearItem = function(t) {
    ctrl.selectedItem = null;
    $rootScope.$broadcast('selectedItem', null);
    }

    function buildFilterQuery() {
    var selectedFilterText = '';
    /*if(ctrl.selectedFilter) {
            selectedFilterText = ctrl.selectedFilter.filter.text;
    }*/
    return ctrl.textFilter
        .replace(selectedFilterText, '')
        .replace('+()', '')
        .trim();
    }

    ctrl.execFilter = function() {
    var queryString = buildFilterQuery();
    loadItems();
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

    ctrl.itemTypes = [];
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


    /*
    * Actions
    */
    ctrl.applyAddRelations = function() {
    if(confirm('Really CREATE relations to all the selected Items?')) {
        var targetQuery = ctrl.targetQuery;
        var sourceQuery = ctrl.buildFullItemsQuery();
        itemService.addRelations(ctrl.spaceId, targetQuery, sourceQuery).then(
        function(result) {
            notifier.success("Added relations.");
        }, function(err) {
        notifier.error(err.message);
        });
    }
    }
    ctrl.applyRemoveRelations = function() {
    if(confirm('Really REMOVE relations from all the selected Items?')) {
        var targetQuery = ctrl.targetQuery;
        var sourceQuery = ctrl.buildFullItemsQuery();
        itemService.removeRelations(ctrl.spaceId, targetQuery, sourceQuery).then(
        function() {
            notifier.success("Removed relations.");
        }, function(err) {
        notifier.error(err.message);
        });
    }
    }


    /*
    *  Filters
    */
    ctrl.filters = [];
    ctrl.selectedFilter = null;
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
                    if(itemType)
                        ctrl.selectedFilterItemTypes.push(itemType);
                    lm.ticked = true;
                    }
                    else
                    lm.ticked = false;
                });
                }
                setupItemTypeFilter();
            }
            }

            if(cb)
            cb();
        },
        function(err) {
            notifier.error(err.message);
        });
    });
    }

    ctrl.clearFilters = function() {
    $state.go('in.items', {id:ctrl.spaceId, listMode: '', filter: '', filterQuery: ''});
    }

    /*
    * Tags
    */
    ctrl.tagsSet = [];
    ctrl.tagsRemove = [];
    ctrl.loadTags = function(query) {
    return tagService.getBySpace(ctrl.spaceId, "name:" + query + "*");
    }

    ctrl.addTagsBulk = function() {
    tagService.addItemTags(ctrl.spaceId, ctrl.targetQuery, ctrl.tagsSet)
    .then(function(){
        notifier.success("Added selected Tags to Target Items.");
    },
        function(err) {
        notifier.error(err.message);
        });

    }

    ctrl.removeTagsBulk = function() {
    tagService.removeItemTags(ctrl.spaceId, ctrl.targetQuery, ctrl.tagsRemove)
    .then(function(){
        notifier.success("Removed selected Tags to Target Items.");
    },
        function(err) {
        notifier.error(err.message);
        });

    }

    /*
    *   Form Data
    */
    ctrl.bulkEditData = {
    };

    ctrl.saveFormData = function() {
        var status = null;
        if(ctrl.bulkEditData.status) {
            status = _.findWhere(ctrl.itemStatus,{id:ctrl.bulkEditData.status.id});
        }
        
        var owner = null;
        if(ctrl.bulkEditData.owner) {
            owner = _.findWhere(ctrl.space.users,{id:ctrl.bulkEditData.owner.id});
        }

        var bulkData = {
            status: status ? status : null,
            owner: owner ? owner : null
        }

        if(ctrl.bulkEditData.removeDate)
            bulkData.date = null;
        else if(ctrl.bulkEditData.date)
            bulkData.date = ctrl.bulkEditData.date;        

        itemService.saveBulkData(ctrl.spaceId, ctrl.targetQuery, bulkData)
        .then(function(){
            notifier.success("Bulk-saved fields with set values.");
        },
        function(err) {
        notifier.error(err.message);
        });
    }
}