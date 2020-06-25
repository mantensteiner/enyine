enyine.component('valuesSidebar', {
  templateUrl: '/js/app/components/value/valuesSidebar.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$state', '$stateParams', '$q', 'spaceService', 'itemService', '$timeout', 'valueService',
    'itemTypeService', 'notifier', '$location', 'queryCacheService', 'utilityService', ValuesSidebarController],  
  bindings: {
    spaceId: '<',
    unitDataTypeKey: '<',
    onSetFilter: '&'
  }

});

function ValuesSidebarController($scope, $rootScope, $state, $stateParams, $q, spaceService, itemService, $timeout, valueService,
    itemTypeService, notifier, $location, queryCacheService, utilityService) {
    var ctrl = this;

    // Init
    ctrl.$onInit = function() {
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
        ctrl.selectedTime = null;

        ctrl.changeListMode = function(mode) {
            ctrl.displayMode = mode;
            ctrl.execFilter();
        }

        ctrl.items = [];
        ctrl.take = 15;
        ctrl.skip = 0;
        ctrl.sortDir = 'desc';
        ctrl.sortBy = 'modifiedOn';
        ctrl.moreItemsLoading = false;
        ctrl.selectedFilterItemTypes = [];
        ctrl.itemTypes = [];

        ctrl.valuesHistory = {
            totalValueSum: 0
        };

        loadSpace();
        loadStatus();

        ctrl.loadMoreItems = function(q) {
            ctrl.query = "+(" + q + ") +(" + ctrl.query + ")";

            if(ctrl.moreItemsLoading)
                return;

            ctrl.moreItemsLoading = true;
            if(ctrl.items.length > 0) {
                ctrl.skip += 1;
            }

            loadItems(true);
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

        ctrl.loadMoreItems();
    }

    // Detect if tab becomes active
    ctrl.$onChanges = function (changesObj) {
        if (changesObj.unitDataTypeKey) {
            ctrl.getValuesHistory("year");
        }
    }

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

    function loadStatus() {
        spaceService.getStatus(ctrl.spaceId).success(function(status) {
            ctrl.itemStatus = status;
        });
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
            ctrl.sortBy, ctrl.sortDir, null, true).then(function(items) {
            ctrl.itemsTotal = items.total;
            ctrl.items.push.apply(ctrl.items, items.hits);
            ctrl.itemsLoading = false;
            ctrl.moreItemsLoading = false;

            $scope.$emit('itemsLoaded', ctrl.items);
        }, function(err) {
            ctrl.itemsLoading = false;
            ctrl.moreItemsLoading = false;
            notifier.error("Could not load items");
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

    ctrl.setMood = function(e) {
        if(!ctrl.selectedItem)
            ctrl.selectedItem = {};
        ctrl.selectedItem.mood = e;
        ctrl.changeMood = false;
    }

    ctrl.goToItem = function(item) {
        $state.go('in.item_detail', {spaceId: ctrl.spaceId, id:item.id, tab:''});
    }

    $scope.$on('selectedItem', function (event, data) {
        if(!data) {
            ctrl.selectedItem = null;
        return;
    }

    if(ctrl.$id != data.scopeId) {
        //ctrl.selectedItem = data.item;
        ctrl.selectedItem = _.clone(data.item);

        _.each(ctrl.newItemItemTypesMarkup, function(lm) {
        if(!data.item)
            lm.ticked = false;
        else
            _.findWhere(data.item.itemTypes, lm.id) ?  lm.ticked = true : lm.ticked = false;
        });

        /*_.each(ctrl.filterItemTypesMarkup, function(lm) {
        if(!ctrl.selectedItem.itemTypes)
            lm.ticked = false;
        else
            _.findWhere(ctrl.selectedItem.itemTypes, lm.id) ? lm.ticked = true : lm.ticked = false;
        });*/
    }
    });

    ctrl.getItemType = function(id) {
        return _.findWhere(ctrl.itemTypes, {id:id});
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

    ctrl.execFilter = function() {
        var queryString = formatQueryString(addItemTypeFilterQueryPart(buildTextFilterQuery()));

        /*var url = $state.href("in.space_items", {
            id:ctrl.spaceId, listMode: ctrl.displayMode,
            filter: ctrl.filterId, filterQuery: queryString});

            $location.path(url.replace('#',''))*/

        $state.go('in.space_items', {id:ctrl.spaceId, listMode: ctrl.displayMode,
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



    //
    // History 

    ctrl.roundFixed2 = function(val) {
        return utilityService.roundFixed2(val);
    }

    ctrl.getValuesHistory = function(interval, startPeriod) {
        var query = "*";

        if(startPeriod) {
            if(interval == "month") {
                query = "+date:>=" + startPeriod.year() + " +date:<"+(startPeriod.year()+1);
            }            
            if(interval == "day") {
                query = "+date:>=" + startPeriod.year()+"-"+(startPeriod.month()+1) +
                    " +date:<"+startPeriod.year()+"-"+(startPeriod.month()+2);
            }
        }

        var aggs = null;
        if(ctrl.unitDataTypeKey) {
            aggs = {value_sum:{sum:{field:"value."+ctrl.unitDataTypeKey.dataTypeKey}}};
            aggs.only = true;

            var aggHistoryName = "time_history_"+interval;

            aggs[aggHistoryName] = {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : interval
                }
            };
        }

        valueService.search(ctrl.spaceId, query, aggs).success(function(result) {
            if(!result.aggs)
                return;

            var agg_value_sum = result.aggs.value_sum.value;

            if(interval == "year") {
                ctrl.valuesHistory =_.map(result.aggs[aggHistoryName].buckets, function(r) {
                return {
                    date: moment(r.key_as_string),
                    time_count: r.doc_count,
                    items: []
                }
                });
                ctrl.valuesHistory.totalValueSum = utilityService.roundFixed2(agg_value_sum);
            }
            else {
                var year = _.filter(ctrl.valuesHistory, function(d){
                if(d.date.isSame(startPeriod,'year'))
                    return true;
                })[0];

                if(interval == "month") {
                year.value_sum = agg_value_sum;
                year.items = _.map(result.aggs[aggHistoryName].buckets, function(r) {
                    return {
                    date: moment(r.key_as_string),
                    time_count: r.doc_count,
                    items: []
                    }
                });
                }
                if(interval == "day") {
                var month = _.filter(year.items, function(m){
                    if(m.date.isSame(startPeriod,'month'))
                    return true;
                })[0];
                month.value_sum = agg_value_sum;

                month.items = _.map(result.aggs[aggHistoryName].buckets, function(r) {
                    return {
                    date: moment(r.key_as_string),
                    time_count: r.doc_count,
                    items: []
                    }
                });
                }
            }
        });
    }
    
    ctrl.valueHistoryFilter = [];
    ctrl.setTimeFilter = function(interval, startPeriod) {
        var query = "*";
        var filterText = "";

        if(startPeriod) {
        if(interval == "year") {
            query = "+date:>=" + startPeriod.year() + " +date:<"+(startPeriod.year()+1);
            filterText = "Year " + startPeriod.year();
        }
        if(interval == "month") {
            if(startPeriod.month()+1<12)
            query = "+date:>=" + startPeriod.year()+"-"+(startPeriod.month()+1) + " +date:<"+startPeriod.year()+"-"+(startPeriod.month()+2);
            else
            query = "+date:>=" + startPeriod.year()+"-12" + " +date:<"+startPeriod.year()+1+"-01";
            filterText = "Month " + startPeriod.year()+"-"+(startPeriod.month()+1);
        }
        if(interval == "day") {
            query = "+date:>=" + startPeriod.year()+"-"+(startPeriod.month()+1)+"-"+(startPeriod.date()) +
            " +date:<"+startPeriod.year()+"-"+(startPeriod.month()+1)+"-"+(startPeriod.date()+1);
            filterText = "Day " + startPeriod.year()+"-"+(startPeriod.month()+1)+"-"+(startPeriod.date());
        }
        }

        ctrl.valueHistoryFilter = [];
        ctrl.valueHistoryFilter.push({query: query, name: filterText});
        ctrl.onSetFilter({filter:query});
    };

    ctrl.removeTimeHistoryFilter = function(tf) {
        ctrl.valueHistoryFilter  = _.without(ctrl.valueHistoryFilter, _.findWhere(ctrl.valueHistoryFilter,tf));
        ctrl.onSetFilter({filter:''});
    }  
}