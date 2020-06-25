enyine.component('statsHistoryChart', {
  templateUrl: '/js/app/components/item/statsHistoryChart.html',
  restrict: 'E',
  controller: ['valueService', 'chartService', 'notifier', '$timeout', StatsHistoryChartController],
  bindings: {
    spaceId: '<',
    itemId: '<',
    valueType: '<'
  }
});

function StatsHistoryChartController(valueService, chartService, notifier, $timeout) {
  var ctrl = this;
  
  // Init
  ctrl.$onInit = function() {
    ctrl.historyAggTimeRange = 10;
    ctrl.historyChart = {};
    ctrl.historyCharts = [];
    ctrl.chartViewType = 'discreteBarChart';
    ctrl.chartSeriesXType = null;
    ctrl.showTargetBars = false;

    ctrl.loadHistoryAgg();
  }

  ctrl.loadHistoryAgg = function() {
    ctrl.chartSeriesXType = {
      id: 'date',
      name: 'Date'
    };

    // Defaults
    var metric = ctrl.valueType.metrics[0];
    if(!metric.timeframe)
      metric.timeframe = {id:"D", name:'Day'};
    if(!metric.aggType)
      metric.aggType = {id:"sum",name:'Sum'};

    ctrl.historyChart.aggType = metric.aggType;
    ctrl.historyChart.aggTypeId = metric.aggType.id;

    ctrl.historyChart.interval = metric.timeframe;
    ctrl.historyChart.intervalId = metric.timeframe.id;

    var query = "+(items.id:" + ctrl.itemId + " ) +(valueType.id:" + ctrl.valueType.id + ")";

    query = chartService.addTimeRangeInDaysToQuery(query, ctrl.historyAggTimeRange-1, ctrl.historyChart.interval.exp);

    var agg = {hist_values:{
      date_histogram: {
        field: 'date',
        interval: ctrl.historyChart.interval.exp
      },
      aggs : {
        values: {}
      }
    }, only:true};

    agg.hist_values.aggs.values[ctrl.historyChart.aggType.id] = {field:"value."+ctrl.valueType.dataTypeKey};

    valueService.search(ctrl.spaceId, query, agg, null, null)
      .success(function(result) {
        if(result.aggs) {
          var buckets = result.aggs.hist_values.buckets;
          var yMax = 0;
          var data = _.map(buckets, function(b) {
            if(b.values.value>yMax)
              yMax=b.values.value;
              //return {x: b.key_as_string, y: b.values.value};
            return {x: b.key, y: b.values.value};
          });


          ctrl.seriesVal = {key:ctrl.valueType.symbol,values:data};
          ctrl.seriesTarget = {key:ctrl.valueType.symbol+" Target",values:_.map(data, function(d){
              var nd = d.y+Math.floor(Math.random() * 500);
              return {x:d.x,y:nd};
          })};

          // 
          // Set chart options for history chart
          function xAxisTickFormatFunction(d) {
            //if(ctrl.chartSeriesXType.id=='date') 
            return d3.time.format('%b %d')(new Date(d));

            //if(ctrl.chartSeriesXType.id=='user')
            //  return d;
          }
          var format = d3.format(',.2f');
          function valueFormatFunction(d) {
            return format(d);
          }

          function tooltipContentFunction(key, x, y, e, graph) {
            //if(ctrl.chartSeriesXType.id=='date')
            return '<b>' + key + '</b>: ' +  y + ctrl.selectedUnitItemType.unit.symbol + ', ' + x;
            //if(ctrl.chartSeriesXType.id=='user')
            //    return '<b>' + ctrl.selectedUnitItemType.name + '</b>: ' +  y + ctrl.selectedUnitItemType.unit.symbol + ', ' + x;
          }

          ctrl.chartOptions = chartService.setChartOptions({
            xAxisSymbol: ctrl.valueType.symbol,
            chartViewType: ctrl.chartViewType,
            xSeriesType: ctrl.chartSeriesXType,
            valueFormatFunction: valueFormatFunction,
            tooltipContentFunction: tooltipContentFunction, 
            xAxisTickFormatFunction: xAxisTickFormatFunction
          });
          
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
        notifier.error("Error loading history data.");
      });
  }

  ctrl.toggleTargetBars = function() {
    ctrl.showTargetBars = !ctrl.showTargetBars;
    if(!ctrl.showTargetBars) {
      ctrl.chartData = [ctrl.seriesVal];
    }
    else {
      ctrl.chartData = [ctrl.seriesVal, ctrl.seriesTarget];
    }
  }

  ctrl.toggleChartViewType = function() {
    switch(ctrl.chartViewType) {
      case 'discreteBarChart':
        ctrl.chartViewType = 'multiBarChart';
        break;
      case 'multiBarChart':
        ctrl.chartViewType = 'discreteBarChart';
        break;
    }
  }
}