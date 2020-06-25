
enyine.service('githubService', ['$http', '$q' , function ($http, $q) {

  this.getBySpace = function(id) {
    var defer = $q.defer();

    var url = '/api/github/search';
    var query = '(spaceId:' + id+')';
      
    var body ={
      take: 10000, // take all integrations (should be a few at max)
      skip: 0,
      query: query
    }
    
    function mapSource(hits) {
      return _.map(hits, function(t) {
        return t._source;
      });
    } 
    
    $http.post(url, body)
    .success(function(data, status, headers, config) {
      defer.resolve(mapSource(data.hits ? data.hits.hits : []));
    })
    .error(function(data, status, headers, config) {
      defer.reject(status);
      console.log(config);
    });

    return defer.promise;
  }

  this.getById = function(id) {
    return $http.get('/api/github/get/' + id)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }
  
  this.save = function(repository) {
    return $http.post('/api/github/save', repository)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.delete = function(repositoryId) {
    var data = {
      id: repositoryId
    }
    return $http.delete('/api/github/delete/' + data.id)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }
}]);