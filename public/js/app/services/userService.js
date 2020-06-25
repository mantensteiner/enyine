
enyine.service('userService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {


  this.setUser = function(user) {
    sessionStorage.user = angular.toJson(user);
  }

  this.getUser = function() {
    var defer = $q.defer();
    var self = this;
    return $http.post('/api/auth/getAuthenticatedUser')
      .success(function(data, status, headers, config) {
        sessionStorage.user = angular.toJson(data);
        defer.resolve(angular.fromJson(sessionStorage.user));
      })
      .error(function(data, status, headers, config) {
        $rootScope.redirectLogin();
      });


    return defer.promise;
  }


  this.isAuth = function() {
    if(this.getUser())
      return true;
    return false;
  }
  
  this.getLoggedInUser = function() {
    if(!sessionStorage.user)
      return;
      
    return angular.fromJson(sessionStorage.user);
  }

  this.getById = function(id) {
    return $http.get('/api/user/get/' + id)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.save = function(user) {
    var _user = user;
    return $http.put('/api/user', user)
      .success(function(data, status, headers, config) {
        sessionStorage.user = angular.toJson(_user);
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getActions = function() {
    return $http.post('/api/event/search', {query:'*', take: 10})
      .then(function(data) {
        var r = _.map(data.data.hits.hits, function(t) {
          var result = t._source;
          result.changedFields = result.changedFields[result.type].map(function(x) { return x.name });
          return result;
        });
        return r;
      }, function(err) {
        console.log(err.message);
      });
  }

  this.searchGlobal = function(query, take, skip) {
    return $http.post('/api/search', {search:query, take:take,skip:skip})
      .then(function(data) {
        if(!data.data.hits)
          return [];
        var r = _.map(data.data.hits.hits, function(t) {
          var result = t._source;
          result.type = t._type;
          return result;
        });
        return r;
      }, function(err) {
        console.log(err.message);
      });
  }

  this.getEventItems = function() {
    return $http.get('/api/item/getEventItems')
      .then(function(data) {
        return data.data;
      }, function(err) {
        console.log(err.message);
      });
  }

}]);