enyine.component('statsView', {
  templateUrl: '/js/app/components/item/statsView.html',
  restrict: 'E',
  controller: ['notifier', StatsViewController],
  bindings: {
    spaceId: '<',
    itemId: '<',
    valueType: '<'
  }
});

function StatsViewController(notifier) {
  var ctrl = this;
  ctrl.CHART_TYPE_HISTORY = 'history';
  ctrl.CHART_TYPE_USER = 'user';
  
  // Init
  ctrl.$onInit = function() {
    ctrl.chartType = ctrl.CHART_TYPE_HISTORY;
  }

  /*

  ctrl.loadTermAgg = function() {
    var itemTypeId = ctrl.lastItemTypeId;

    ctrl.chartSeriesXType = {
      id:'user',
      name: 'User'
    }
    var query = "+(items.id:" + ctrl.id + " ) +(items.itemTypeId:" + itemTypeId + ")";
    query = addTimeRangeInDaysToQuery(query, ctrl.historyAggTimeRange-1);

    var agg = {user_values:{
      terms: {
        field: 'comment'
      },
      aggs : {
        values: {}
      }
    }, only:true};

    agg.user_values.aggs.values[ctrl.historyChart.aggType.id] = {field:"value."+un.dataTypeKey};

    valueService.search(ctrl.spaceId, query, agg, null, null)
      .success(function(result) {
        if(result.aggs) {
          var buckets = result.aggs.user_values.buckets;
          var yMax = 0;
          var data = _.map(buckets, function(b) {
            if(b.values.value>yMax)
              yMax=b.values.value;
              //return {x: b.key_as_string, y: b.values.value};
            return {x: b.key, y: b.values.value};
          });


          ctrl.seriesVal = {key:'Comment Term',values:data};
          ctrl.seriesTarget = {key:"Comment Term Target",values:_.map(data, function(d){
              var nd = d.y+Math.floor(Math.random() * 500);
              return {x:d.x,y:nd};
          })};

          setChartOptions(ctrl.chartType, ctrl.chartSeriesXType);
          ctrl.showTargetBars = !ctrl.showTargetBars;
          ctrl.toggleTargetBars();

          if(ctrl.chartData[0].values.length > 0) {
            var series1Map = _.map(ctrl.chartData[0].values,function(el){return el.y});
            ctrl.chartDataAggs = {
              avg: (_.reduce(series1Map, function(el1,el2){return el1+el2}) / series1Map.length)
            }
          }
        }
      }).error(function(){
        notifier.error("Error loading comment term histogram data.");
      });
  }
  */

}