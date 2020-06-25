enyine.component('itemDetailValuesTab', {
  templateUrl: '/js/app/components/item/itemDetailValuesTab.html',
  restrict: 'E',
  controller: ['$scope', 'valueService', 'spaceService', 'notifier', '$timeout', '$q', ItemDetailValueTabController],
  bindings: {
      spaceId: '<',
      valueType: '<',
      activeTab: '<',
      item: '<',
      itemType: '<'
  }
});


function ItemDetailValueTabController($scope, valueService, spaceService, notifier, $timeout, $q) {
  var ctrl = this;
  
  // Init
  ctrl.$onInit = function () {
    loadSpace();
  };

  function loadSpace() {
    if(ctrl.spaceId) {
      spaceService.getById(ctrl.spaceId).success(function(p) {
        ctrl.space = p;
        ctrl.spaceName = p.name;
      }).error(function(err) {
          notifier.error(err);
        });
    }
  }

  
  // Detect if tab becomes active
  ctrl.$onChanges = function (changesObj) {
    if (changesObj.activeTab && changesObj.activeTab.currentValue.indexOf('values') === 0) {
      initValues();
      loadValues();
    }
    if (changesObj.valueType && changesObj.valueType.currentValue) {
      ctrl.valueTypeId = changesObj.valueType.currentValue.sourceId;
      ctrl.valueType.id = ctrl.valueTypeId;
    }
  };

  function initValues() {
    ctrl.spaceValuesLoading = false;
    ctrl.spaceValues = [];
    ctrl.valueSum = 0;
    ctrl.valuesTotal = 0;
    ctrl.takeValues = 30;
    ctrl.skipValues = 0;
    ctrl.moreValuesLoading = false;
    ctrl.selectedValue = null;
    ctrl.showStats = false;
  }

  function loadValues(loadMore, itemTypeId) {
    var defer = $q.defer();

    if(!loadMore) {
      ctrl.spaceValuesLoading = true;
      ctrl.spaceValues = [];
      ctrl.skipValues = 0;
    }
    
    var query = "+(items.id:" + ctrl.item.id + " ) +(valueType.id:" + ctrl.valueTypeId + ")";

    loadValuesAgg(ctrl.valueType);
    
    var aggConfig = {value_sum:{sum:{field:"value."+ctrl.valueType.dataTypeKey}}};
    valueService.search(ctrl.spaceId, query, aggConfig, ctrl.takeValues, ctrl.skipValues)
      .success(function(result) {
        buildValuesResult(result);
      }).error(function(){buildValuesResult([]);});

    function buildValuesResult(result) {
      if(!result.hits) {
        defer.resolve([]);
        return;
      }

      var hits = _.map(result.hits.hits, function(tt){  return tt._source; });
      ctrl.valuesTotal = result.hits.total;

      ctrl.spaceValues.push.apply(ctrl.spaceValues, hits);
      if(result.aggs) {
        ctrl.valueSum = result.aggs.value_sum.value;
      }

      if(ctrl.spaceValues.length > 0) {
        ctrl.noTimeData = false;
      }

      defer.resolve(ctrl.spaceValues);
    }

    return defer.promise;
  }

  function loadValuesAgg(valueType) {
    if(!valueType) return;

    // Defaults
    var metric = valueType.metrics[0];
    if(!metric.timeframe)
      metric.timeframe = {id:"D", name:'Day'};
    if(!metric.aggType)
      metric.aggType = {id:"sum",name:'Sum'};

    var timeframe = metric.timeframe;
    var aggregationType = metric.aggType.id;

    var query = "+(items.id:" + ctrl.item.id + " ) +(valueType.id:" + ctrl.valueTypeId + ")";

    query = addTimeframeToQuery(query, timeframe);

    var agg = {value_sum:{}, only:true};
    agg.value_sum[aggregationType] = {field:"value."+ctrl.valueType.dataTypeKey};


    valueService.search(ctrl.spaceId, query, agg, null, null)
      .success(function(result) {
        if(result.aggs)
          ctrl.valueSum =  result.aggs.value_sum.value;
      }).error(function(){buildValuesResult([]);});
  }
  
  function addTimeframeToQuery(query, timeframe) {
    if(timeframe.id === 'A')
      return query;
      
    // Example: date:[now-1d/d TO now/d]

    var tq = query+  " +(date:";
    var tf = timeframe.id;

    if(tf === 'H') {
      // TODO: CHANGE TO HOUR, CURRENTLY DAY
      var seed = moment().format('YYYY-MM-DD');
      tq += "<="+seed+")";
      //tq += '[now-1h/h TO now/h]' + ')';
    }
    if(tf === 'D') {
      tq += '[now-1d/d TO now/d]' + ')'; // range-syntax ES5
    }
    if(tf === 'W') {
      var seed = moment().subtract(1, 'weeks').format('YYYY-MM-DD');
      tq += ">="+seed+")";
    }
    if(tf === 'M') {
      var seed = moment().subtract(1, 'months').format('YYYY-MM-DD');
      tq += ">="+seed+")";
    }
    if(tf === 'Y') {
      var seed = moment().subtract(1, 'years').format('YYYY-MM-DD');
      tq += ">="+seed+")";
    }

    return tq;
  }

  /*
      Values
   */
  ctrl.saveValue = function(value) {
    if(value && value.value.value) {
      ctrl.selectedValue = value.value;
    }
    else {
      ctrl.selectedValue = value;
    }

    // Detect if no specific time entered (must be a non-time date, add 12 hours to be safe about timezones) 
    if(moment(ctrl.selectedValue.date).hours()== 0 && 
      moment(ctrl.selectedValue.date).minutes()== 0 &&
      moment(ctrl.selectedValue.date).seconds()== 0 &&
      moment(ctrl.selectedValue.date).millisecond()== 0) {
        ctrl.selectedValue.date = moment(ctrl.selectedValue.date).add(12, 'hours')._d;
    }

    ctrl.selectedValue.spaceId = ctrl.spaceId;

    ctrl.selectedValue.items = [{
      id: ctrl.item.id,
      itemTypeId: ctrl.item.itemTypeId || null
    }];

    if(!ctrl.selectedValue.valueType) {
      ctrl.selectedValue.valueType = {
        id: ctrl.valueType.sourceId,
        metricId: null,
        quantityId: ctrl.valueType.quantityId,
        symbol: ctrl.valueType.symbol,
        factor:null,
        dataTypeKey: ctrl.valueType.dataTypeKey
      }
    }

    valueService.save(ctrl.selectedValue, ctrl.unit).success(function(_value) {
      ctrl.selectedValue = null;
      $("#saveValueToItemModal").modal('hide');
      notifier.success('Value entry saved!');
      if(!_.findWhere(ctrl.spaceValues, {id: _value.id}))
        ctrl.spaceValues.splice(0,0,_value);
    }).error(function(err){
      notifier.error(err.message);
    });
  }

  ctrl.deleteValue = function(id) {
    if(confirm("Really delete Value?")) {
      valueService.delete(id, ctrl.spaceId).then(function() {
        ctrl.spaceValues  = _.without(ctrl.spaceValues, _.findWhere(ctrl.spaceValues, {id: id}));
        notifier.success("Value deleted!");
      }, function(err) {
        notifier.error(err.message);
      });
    }
  }

  /*
  ctrl.loadMoreValues = function(tabName) {
    if(ctrl.moreValuesLoading || ctrl.toggleStats)
      return;

    if(ctrl.activeTab && ctrl.activeTab.indexOf('values')!==0)
      return;


    ctrl.moreValuesLoading = true;
    if(ctrl.spaceValues.length > 0)
      ctrl.skipValues += 1;
    loadValues(true, ctrl.valueTypeId).then(function() {
      ctrl.moreValuesLoading = false;
    });
  }

  ctrl.valueSums = {};
  ctrl.lastItemTypeId = null;

  ctrl.selectedValue = {
    time:0,
    date:new Date(),
    items: [{id:ctrl.id}]
  };

  ctrl.setActiveValue = function(v) {
    ctrl.activeValue = v;
  }
  ctrl.selectValue = function(t, unitItemType) {
    ctrl.unit = unitItemType.metrics[0];
    if(t == null)
      ctrl.selectedValue = {value:{[unitItemType.dataTypeKey]:0}, date:new Date(), items: [{
        id:ctrl.id,
        itemTypeId: ctrl.item.itemTypeId}]};
    else {
      ctrl.selectedValue = t;
    }
  }


  */



  //
  // Value comment autocomplete
  ctrl.currentComment = "";
  /*
  ctrl.getSuggestions=function(text) {
    if(!text)
      return;
    return valueService.autoCompleteComment(text).then(function(result){
      return result.options;
    },
    function(err) {
      notifier.error("Error loading comment suggestions.");
    });
  }
  */
  ctrl.editValueComment = function(pv) {
    pv.descriptionText = pv.description;
    pv.editComment=!pv.editComment;
    ctrl.tmpValueComment = pv.description;
  }
  ctrl.cancelValueCommentEdit = function(pv) {
    pv.description = ctrl.tmpValueComment ? ctrl.tmpValueComment : null;
    delete pv.editComment;
    delete pv.descriptionText;
    ctrl.tmpValueComment = null;
  }
  ctrl.saveValueComment = function(pv) {
    if(pv.descriptionText===pv.description)
      pv.description = null;
    else
      pv.description = pv.descriptionText;
    delete pv.editComment;
    delete pv.descriptionText;
    ctrl.tmpValueComment = null;
    ctrl.saveValue(pv);
  }  


  //
  // Charts
  ctrl.toggleStatsView = function() {
    ctrl.showStats=!ctrl.showStats;
  }

}
