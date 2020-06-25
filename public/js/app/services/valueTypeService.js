
enyine.service('valueTypeService', ['$http', '$q', function ($http, $q) {

  this.get = function(query, take, skip, fields) {
    return $http.get('/api/valuetype/get')
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getBySpace = function(id, query, take, skip, fields) {
    var defer = $q.defer();

    function mapSource(hits) {
      return _.map(hits, function(t) {
        return t._source;
      });
    } 

    var url = '/api/valuetype/search';
    var body ={
      take: take,
      skip: skip,
      spaceId: id,
      query: query || null,
      fields: fields || null
    }

    $http.post(url, body)
    .success(function(data, status, headers, config) {
      defer.resolve( mapSource(data.hits ? data.hits.hits : []));
    })
    .error(function(data, status, headers, config) {
      defer.reject(status);
      console.log(config);
    });

    return defer.promise;
  }

  this.getById = function(spaceId, id) {
    return $http.get('/api/valuetype/get/' + spaceId + '/' + id)
      .success(function(data, status, headers, config) {
        var result = data;
        return result;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.delete = function(id) {
    return $http.delete('/api/valuetype/delete/' + id)
      .then(function(data) {
        return data;
      });
  }

  this.save = function(valueType) {      
    return $http.post('/api/valuetype/save', valueType)
      .then(function(data, status, headers, config) {
        return data;
      });
  }

}]);
