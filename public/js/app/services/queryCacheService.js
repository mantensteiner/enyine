enyine.service('queryCacheService', 
        ['$http',
function ($http) {
  this.setItemsQuery = function(q) {
    if(!q) {
      sessionStorage.removeItem('last_items_query');
    }
    else { 
      sessionStorage.last_items_query = q;
    }
    
  }
  this.getItemsQuery = function() {
        return sessionStorage.last_items_query;
  }
}]);