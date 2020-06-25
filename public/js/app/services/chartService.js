
enyine.service('chartService', ['$http', function ($http) {



  this.addTimeRangeInDaysToQuery = function(query, range, intervalExp) {
    var tq = query+  " +(date:>="
      + moment().subtract(range, intervalExp + 's').format('YYYY-MM-DD')
      + ")";
    return tq;
  }


  this.setChartOptions = function(options) {
    var self = this;
    return {
        chart: {
            type: options.chartViewType,
            height: 450,
            clipEdge: true,
            staggerItemTypes: true,
            transitionDuration: 500,
            stacked: false,
            "margin": {
              "top": 20,
              "right": 20,
              "bottom": 60,
              "left": 45
            },
            xAxis: {
                axisItemType: options.xSeriesType.name,
                showMaxMin: true,
                tickFormat: options.xAxisTickFormatFunction
            },
            yAxis: {
                axisItemType: options.xAxisSymbol,
                tickFormat: options.valueFormatFunction,
                axisItemTypeDistance: 40
            },
            showValues: true,
            valueFormat: options.valueFormatFunction,
            tooltipContent: options.tooltipContentFunction
            /*barColor: function(d, i){
              var colors = d3.scale.category20().range();
              var rnd = Math.floor(Math.random() * colors.length)
              return colors[rnd];
            }*/
        }
    };
  }

}]);
