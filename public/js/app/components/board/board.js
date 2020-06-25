enyine.component('board', {
  templateUrl: '/js/app/components/board/board.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$state', '$stateParams', '$q',
               'spaceService', 'itemService', '$timeout', 'notifier', 'itemTypeService', BoardController]
});

function BoardController($scope, $rootScope, $state, $stateParams, $q,
    spaceService, itemService, $timeout, notifier, itemTypeService) {
    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.spaceId = $stateParams.id;
        ctrl.space = null;
        ctrl.spaceLoading = false;
        ctrl.itemsLoading = false;
        ctrl.textFilter = "";
        ctrl.itemStatus = [];
        ctrl.selectedItem = null;
        ctrl.colWidth = 3;
        ctrl.selectedFilterItemTypes = [];
        ctrl.itemTypes = [];

        loadProject();
        loadStatus();
        loadMissingStatusItems();
    }

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

    function loadStatus() {
        spaceService.getStatus(ctrl.spaceId).then(function(status) {
            ctrl.itemStatus = status.data;

            var cWidthNum = 12 / ctrl.itemStatus.length;
            ctrl.colWidth  = Math.floor(cWidthNum);
            ctrl.colRemainderWidth = null;

            if(( cWidthNum % 2) != 0)
                ctrl.colRemainderWidth = (12 - (ctrl.colWidth*(ctrl.itemStatus.length-1)) );

            initItems();
            loadItems();
        }, function(err) {
            notifier.error(err.message);
        });
    }

    function initItems() {
        ctrl.itemsByStatus = {};
        _.each(ctrl.itemStatus, function(ts) {
           ctrl.itemsByStatus['s'+ts.id] = {id: ts.id, take:10,skip:0,items:[],loadMore:false, loading: false}
        });
    }

    function loadItems() {
        _.each(ctrl.itemsByStatus, function(ts) {
           loadStateItems(ctrl.itemsByStatus['s'+ts.id]);
        });
    }

    ctrl.selectItemStatus = function(s) {
        ctrl.selectedS = s;
        ctrl.selectedHist = [{key: 'Modified Items', values:ctrl.itemsByStatus['s'+ctrl.selectedS.id].modifiedHist}];
    }

    ctrl.loadMoreStateItems = function(statusId) {
        if(ctrl.itemsByStatus['s'+statusId].loadMore)
        return;

        ctrl.itemsByStatus['s'+statusId].loadMore = true;
        if(ctrl.itemsByStatus['s'+statusId].items.length > 0)
        ctrl.itemsByStatus['s'+statusId].skip += 1;
        loadStateItems(ctrl.itemsByStatus['s'+statusId]);
    }

    function loadStateItems(stateItems) {
        stateItems.loading = true;
        var query = '';
        if(ctrl.textFilter) {
        query = "+(" + ctrl.textFilter + ")";
        }

        if(ctrl.itemTypeFilter) {
            if(!query)
                query = '+('+ctrl.itemTypeFilter+')';
            else
                query += ' +('+ctrl.itemTypeFilter+')';
        }

        query += " +(status.id:" + stateItems.id + ")";

        var agg = { modifiedon: { date_histogram: { field: 'modifiedOn', interval: 'day' } } };

        itemService.getBySpace(ctrl.spaceId, query.trim(), stateItems.take, stateItems.skip,null,false,null,null,agg,true)
        .then(function(items) {
            if(items) {
                if(items.aggs && items.aggs.modifiedon) {
                    var buckets = items.aggs.modifiedon.buckets;
                    var data = _.map(buckets, function(b) {
                        return {x: b.key, y: b.doc_count};
                    });
                    stateItems.modifiedHist = data;
                }

                stateItems.total = items.total;
                stateItems.items.push.apply(stateItems.items, items.hits);
            }
            else {
                stateItems.total = 0;
                stateItems.items = [];
            }


            stateItems.loading = false;
            stateItems.loadMore = false;
            ctrl.loadMore = false;
        });
    }

    function loadMissingStatusItems() {
        itemService.getBySpace(ctrl.spaceId, '_missing_:status.id',0, 0,null,false,null,null,null,true)
        .then(function(items) {
            if(items && items.total)
                ctrl.missingStatusItemsCount = items.total;
            else 
                ctrl.missingStatusItemsCount = 0;
        });
    }

    function getStateItems(statusId) {
        return ctrl.itemsByStatus['s'+statusId].items;
    }

    loadItemTypes(function(err, mkup) {
        if(err)
            return;
        ctrl.itemTypesMarkup = mkup;
    });

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

    ctrl.getItemType = function(id) {
        return _.findWhere(ctrl.itemTypes, {id:id});
    }

    ctrl.filterByItemTypes = function(el) {
        initItems();
        if(ctrl.selectedFilterItemTypes.length == 0) {
            ctrl.itemTypeFilter = '';
            loadItems(false);
            return;
        }
        ctrl.itemTypeFilter = '+(';
        _.each(ctrl.selectedFilterItemTypes, function(lf) {
            ctrl.itemTypeFilter += ' itemTypeId:'+lf.id;
        });
        ctrl.itemTypeFilter = ctrl.itemTypeFilter.trim() + ')';
        loadItems(false);
    }

    ctrl.viewLoading = function() {
        if(ctrl.spaceLoading)
            return true;
        return false;
    }

    ctrl.setMood = function(e) {
        ctrl.selectedItem.mood = e;
        ctrl.changeMood = false;
    }

    ctrl.editItem = function(t) {
        ctrl.selectedItem = t;
        $rootScope.$broadcast('selectedItem', {item:t, scopeId:ctrl.$id});
    }

    $scope.$on('selectedItem', function (event, data) {
        if(!data) {
            ctrl.selectedItem = null;
            return;
        }

        if(ctrl.$id != data.scopeId) {
            ctrl.selectedItem = data.item;
        }
    });

    ctrl.filterItem = function(t) {
        ctrl.$emit('filterItem', t);
    }

    ctrl.clearItem = function(t) {
        ctrl.selectedItem = null;
        $rootScope.$broadcast('selectedItem', null);
    }

    ctrl.saveItem = function() {
        ctrl.selectedItem.spaceId = ctrl.spaceId;
        if(ctrl.selectedItem.status)
            ctrl.selectedItem.status = _.findWhere(ctrl.itemStatus,{id: ctrl.selectedItem.status.id});

        itemService.save(ctrl.selectedItem).success(function(item) {
            $rootScope.$broadcast('itemSaved', item);
            $("#addItemModal").modal('hide');
            notifier.success('Item \'' + item.name + '\’ changed!');
        }).error(function(err) {
            notifier.error(err.message);
        });
    }

    $scope.$on('itemSaved', function (event, item) {
        // Remove from old state col
        if(ctrl.selectedItemOldStateId) {
            var tarr = getStateItems(ctrl.selectedItemOldStateId);
            ctrl.itemsByStatus['s'+ctrl.selectedItemOldStateId].items = _.without(tarr, ctrl.selectedItem);
        }

        var targetStateItems = getStateItems(item.status.id);
        var indexOfItem = _.indexOf(targetStateItems,_.findWhere(targetStateItems, {id:item.id}));
        if(indexOfItem === -1)
            targetStateItems.push(item);
        else
            targetStateItems[indexOfItem] = item;

        ctrl.selectedItem = null;
        ctrl.selectedItemOldStateId = null;
    });

    ctrl.deleteItem = function() {
        itemService.delete( ctrl.selectedItem.id, ctrl.spaceId)
        .success(function() {
            $rootScope.$broadcast('itemDeleted', ctrl.selectedItem);
        });
    }

    $scope.$on('itemDeleted', function (event, item) {
        var items = getStateItems(item.status.id);
        ctrl.itemsByStatus['s'+item.status.id].items  = _.without(items, item);
        ctrl.selectedItem = null;
        $("#addItemModal").modal('hide');
    });

    ctrl.execFilter = function() {
        initItems();
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

    ctrl.onDropComplete=function(item,evt,statusId){
        if(item.status.id === statusId)
            return;

        ctrl.selectedItem = item;
        ctrl.selectedItem.status.id = statusId;
        ctrl.saveItem();
    }

    $scope.$on('elDropped', function(event, data) {
        // this is your application logic, do whatever makes sense
        var drag = angular.element(data.dragEl);
        var drop = angular.element(data.dropEl);
        var sourceStatusId = drag.data().statusId;
        var targetStatusId = drop.data().statusId;

        if(targetStatusId === sourceStatusId)
        return;

        var sourceStateItems = ctrl.itemsByStatus['s'+sourceStatusId].items;
        var item = _.findWhere(sourceStateItems, {id:data.dragEl.id});

        ctrl.selectedItem = item;
        ctrl.selectedItemOldStateId = sourceStatusId;
        ctrl.selectedItem.status.id = targetStatusId;

        ctrl.saveItem();
        
        ctrl.itemsByStatus['s'+sourceStatusId].total = ctrl.itemsByStatus['s'+sourceStatusId].total - 1;
        ctrl.itemsByStatus['s'+targetStatusId].total = ctrl.itemsByStatus['s'+targetStatusId].total + 1;
        
    });

    ctrl.itemCreated = function() {
        initItems();
        loadItems();
    }
}