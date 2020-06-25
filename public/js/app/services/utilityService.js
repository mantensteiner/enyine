
enyine.service('utilityService', ['$state', function ($state) {


  this.leaveModal = function(modalId, state, params) {
    if(state && params) {
        $state.go(state, params);
    }
    if(modalId) {
      $(modalId).modal('hide');
    }
    else {
      $('body').removeClass('modal-open');
    }

    $('.modal-backdrop').remove();
  }

  this.roundFixed2 = function(number) {
    return (Math.round(number * 100) / 100).toFixed(2);
  }

  this.getFromNow = function(date) {
    return moment(date).fromNow();
  }

  this.isActiveState = function(state) {
      return ($state.current.name === state) ?  true : false;
  }

  this.cleanObject = function(obj) {
    return JSON.parse(angular.toJson(obj));
  }

  /*


  $rootScope.timeframes = [
    {id:'H',name:'Hour',exp:'hour'},
    {id:'D',name:'Day',exp:'day'},
    {id:'W',name:'Week',exp:'week'},
    {id:'M',name:'Month',exp:'month'},
    {id:'Q',name:'Quarter',exp:'quarter'},
    {id:'Y',name:'Year',exp:'year'},
    {id:'A',name:'All',exp:'*'}
    ];

  $rootScope.aggregationTypes = [
    {id:'sum',name:'Sum'},
    {id:'avg',name:'Average'},
    {id:'min',name:'Min'},
    {id:'max',name:'Max'},
    {id:'value_count',name:'Value Count'},
    {id:'last',name:'Last'}
    ];

  */


}]);