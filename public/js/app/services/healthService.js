
enyine.service('healthService', ['$http', function ($http) {

  this.status = function() {
    return $http.get('/api/status')
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }
}]);