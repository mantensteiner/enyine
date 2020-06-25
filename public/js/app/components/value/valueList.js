enyine.component('valueList', {
  templateUrl: '/js/app/components/value/valueList.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$state', '$stateParams', '$q', 'spaceService', '$timeout', 'valueService',
    'itemService', 'notifier', 'userService', 'itemTypeService', 'utilityService', ValueListController]
});

function ValueListController($scope, $rootScope, $state, $stateParams, $q, spaceService, $timeout, valueService,
  itemService, notifier, userService, itemTypeService, utilityService) {
  var ctrl = this;

  ctrl.$onInit = function () {
    ctrl.spaceId = $stateParams.id;
    ctrl.space = null;
    ctrl.spaceLoading = false;
    ctrl.spaceValuesLoading = false;
    ctrl.itemTypes = [];
    ctrl.spaceValues = [];
    ctrl.noTimeData = true;
    ctrl.selectedValue = {};
    ctrl.valueSum = 0;
    ctrl.valuesTotal = 0;
    ctrl.textFilter = "";
    ctrl.itemStatus = [];
    ctrl.valueHistoryFilter = null;
    ctrl.selectedItemType = {};
    ctrl.selectedUnit = {};
    ctrl.itemNames = [];
    ctrl.spaceValues = [];
    ctrl.take = 30;
    ctrl.skip = 0;
    ctrl.moreValuesLoading = false;
    ctrl.searchError = false;
    ctrl.itemFilter = [];
    ctrl.items = [];

    ctrl.selectedItems = {};
    ctrl.select2Options = {
      'multiple': true,
      'simple_tags': true
    };

    ctrl.selectedValue = {
      value: {},
      date:new Date()
    };
    
    $(document).ready(function () {
      $('[data-toggle="offcanvas"]').click(function () {
        $('.row-offcanvas').toggleClass('active')
      });
    });

    $scope.$on('itemsLoaded', function (event, data) {
      ctrl.items = data;
    });

    $scope.$on('elDropped', function(event, data) {
      var drag = angular.element(data.dragEl);
      var drop = angular.element(data.dropEl);

      var item = _.findWhere(ctrl.items, {id:data.dragEl.id});
      var value =  _.findWhere(ctrl.spaceValues, {id:data.dropEl.id});

      if(!value.items) {
        value.items= [];
      }

      if(_.findWhere(value.items, {id: item.id}))
        return;

      ctrl.selectedItems.selected = _.map(value.items, function(tpc){return tpc.id;});
      value.items[0] =  { id: item.id, itemTypeId: item.itemTypeId };
      //value.items.push(item);
      ctrl.saveValue(value, 'items');
    });

    $scope.$on('filterItem', function (event, data) {
      ctrl.itemFilter.push(data);
      loadValues();
    });

    loadSpace();
    loadValues({loadMore:false});
    loadStatus();
    loadItemNames();
  }

  ctrl.$onChanges = function (changesObj) {
  }

  ctrl.unitSelected = function() {
    if(ctrl.selectedItemType.selected && ctrl.selectedUnit.selected && !ctrl.moreValuesLoading) {
      loadValues();
    }
  }

  ctrl.changedValue = function() {
      loadValues();
  }

  ctrl.clearSelectedUnit = function() {
    ctrl.selectedItemType.selected = null;
    ctrl.selectedUnit.selected = null;
    loadValues();
  }

  function loadSpace() {
    ctrl.spaceLoading = true;
    var defer = $q.defer();

    if(ctrl.spaceId) {
      spaceService.getById(ctrl.spaceId).success(function(p) {
        ctrl.space = p;
        ctrl.spaceName = p.name;
        ctrl.spaceLoading = false;

        /*loadValues().then(function() {
          ctrl.spaceValuesLoading = false;
        });*/

        // Select unit if only 1
        if(ctrl.space.units && ctrl.space.units.length == 1) {
          ctrl.selectedUnit.selected = ctrl.space.units[0].id;
        }

        /*
            filter item types for space & aggregate by sourceId
          */
        itemTypeService.getBySpace(ctrl.spaceId, '*', 10000, 0)
        .then(function(result) {
          ctrl.itemTypes = result;
        },
        function(err) {
          notifier.error(err);
        });

        defer.resolve(ctrl.space);
      }).error(function(err) {
        notifier.error(err);
      });
    }

    return defer.promise;
  }

  function loadStatus() {
    spaceService.getStatus(ctrl.spaceId).success(function(status) {
      ctrl.itemStatus = status;
    });
  }

  function loadItemNames() {
    itemService.getBySpace(ctrl.spaceId, '*', 10000, 0, ['name','id']).then(function(itemNames) {
      ctrl.itemNames = itemNames;
    });
  }

  ctrl.getItemName = function(id) {
    var res = _.findWhere(ctrl.itemNames, {id: id});
    if(res)
      return res.name;
  }

  ctrl.loadMoreValues = function() {
    if(ctrl.moreValuesLoading)
      return;
    ctrl.moreValuesLoading = true;
    if(ctrl.spaceValues.length > 0)
      ctrl.skip += 1;
    loadValues({loadMore: true})
    .then(function() {
      ctrl.moreValuesLoading = false;
    });
  }

  function loadValues(options) {
    if(!options) {
      options = {
        loadMore: false
      };
    }
    var defer = $q.defer();
    
    if(!options.loadMore) {
      ctrl.spaceValuesLoading = true;
      ctrl.spaceValues = [];
      ctrl.skip = 0;
    }
    
    function buildValuesResult(result) {
      if(result.hits.hits.length == 0) {
        defer.resolve([]);
        return;
      }

      var resultValues = _.map(result.hits.hits, function(tt) { return tt._source; });

      ctrl.spaceValues.push.apply(ctrl.spaceValues, resultValues);
      ctrl.valueSum = result.aggs ? utilityService.roundFixed2(result.aggs.value_sum.value) : null;
      ctrl.valuesTotal = result.hits.total;
      if(ctrl.spaceValues.length > 0)
        ctrl.noValueData = false;

      defer.resolve(ctrl.spaceValues);
    }

    var query = "*";
    if(ctrl.itemFilter && ctrl.itemFilter.length > 0) {
      query = "+(";
      _.each(ctrl.itemFilter, function(tf) {
        query += "items.id:" + tf.id + " OR ";
      });
      query = query.substring(0, query.length - 4) + ")";
    }

    if(ctrl.valueHistoryFilter) {
      if(query != "*")
        query += " AND +(";
      else
        query = "+(";
      query += ctrl.valueHistoryFilter + ")";
    }

    if(ctrl.textFilter) {
      if(query != "*")
        query += " AND +(";
      else
        query = "+(";

      query += ctrl.textFilter + ")";
    }

    if(ctrl.selectedUnit && ctrl.selectedUnit.selected) {
      query += " +(valueType.id:" + ctrl.selectedUnit.selected.sourceId + ")";
    }

    var sum_agg = null;
    if(ctrl.selectedUnit.selected) {
      sum_agg = {value_sum:{sum:{field:"value."+ctrl.selectedUnit.selected.dataTypeKey}}};
    }

    valueService.search(ctrl.spaceId, query, sum_agg, ctrl.take, ctrl.skip)
      .then(function(result) {
        ctrl.searchError = false;
        ctrl.spaceValuesLoading = false;
        buildValuesResult(result.data);
      },function(err) {
        ctrl.searchError = true;
        buildValuesResult([]);
      });
    
    return defer.promise;
  }

  ctrl.execFilter = function() {
    loadValues();
  }

  ctrl.deleteValue = function(id) {
    if(confirm("Really delete Record?")) {
      valueService.delete(id, ctrl.spaceId).then(function() {
        ctrl.spaceValues  = _.without(ctrl.spaceValues, _.findWhere(ctrl.spaceValues, {id: id}));
        notifier.success("Record deleted!");
      }, function(err) {
        notifier.error(err.message);
      });
    }
  }

  ctrl.viewLoading = function() {
    if(ctrl.spaceTagsLoading || ctrl.spaceLoading)
      return true;

    return false;
  }

  ctrl.editSpace = function(p) {
    $rootScope.$broadcast('editSpace', ctrl.space);
  }

  ctrl.selectValue = function(t) {
    if(t == null) {
      ctrl.selectedValue = {value:{}, date:new Date()};
      ctrl.selectedValue.value[ctrl.selectedUnit.selected.dataTypeKey] = 0;
      // Watcher, because range-input is 'string'
      $scope.$watch('selectedValue.value' + ctrl.selectedUnit.selected.dataTypeKey,function(val,old){
        ctrl.selectedValue.value[ctrl.selectedUnit.selected.dataTypeKey]  = Number(val); 
      });
      resetUiSelect();
    } else {
      ctrl.selectedValue = t;
      if(t.items && t.items.length > 0)
        ctrl.selectedItems.selected = _.map(t.items, function(t){return t.id;});
      else
        resetUiSelect();
    }

    function resetUiSelect() {
      $timeout(function () {
          $scope.$apply(function () {
            ctrl.selectedItems = {};
          });
      }, 700);
    }
  }

  // Update value
  ctrl.saveValue = function(value, changedField) {
    if(value)
      ctrl.selectedValue = value;

    if(!ctrl.selectedValue.valueType) {
      return notifier.error('No value type/unit selected for value.');
    }

    // Detect if no specific time entered (must be a non-time date, add 12 hours to be safe about timezones) 
    if(moment(ctrl.selectedValue.date).hours()== 0 && 
      moment(ctrl.selectedValue.date).minutes()== 0 &&
      moment(ctrl.selectedValue.date).seconds()== 0 &&
      moment(ctrl.selectedValue.date).millisecond()== 0) {
        ctrl.selectedValue.date = moment(ctrl.selectedValue.date).add(12, 'hours')._d;
    }

    var updateFields = changedField ? [changedField] : ['value', 'comment', 'date', 'responsible'];
    valueService.save(ctrl.selectedValue, null, updateFields)
      .then(function(value) {
          notifier.success('Value updated!');        
      }, function(err) {
        notifier.error(err.message);
      });
  }

  ctrl.resetItemFilters = function() {
    ctrl.itemFilter = [];
    ctrl.valueHistoryFilters = [];
    loadValues();
  }

  ctrl.removeItemFilter = function(tf) {
    ctrl.itemFilter  = _.without(ctrl.itemFilter, _.findWhere(ctrl.itemFilter,tf));
    loadValues();
  }

  ctrl.editItem = function(t) {
    $rootScope.$broadcast('selectedItemForEdit', t);
  }

  ctrl.clearItem = function(t) {
    $rootScope.$broadcast('clearItem', t);
  }

  ctrl.getItem = function(id) {
    return _.findWhere(ctrl.items, {id:id});
  }

  ctrl.historyFilterSet = function(historyFilter) {
    ctrl.valueHistoryFilter = historyFilter.filter;
    loadValues({loadMore:false});
  }
}