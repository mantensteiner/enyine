
enyine.service('messageService', ['$http', '$q', function ($http, $q) {
  this.get = function() {
    return $http.get('/api/message/get')
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getBySpace = function(id, search, take, skip, fields) {
    var defer = $q.defer();

    var url = '/api/message/search';
    var body ={
      take: take,
      skip: skip,
      query: search ? search : null,
      fields: fields ? fields : null,
      spaceId: id
    }

    $http.post(url, body)
      .success(function(data, status, headers, config) {
        var result = [];
        if(data.hits)
          result = data.hits.hits;

        if(fields) {
          var m1 = _.map(result, function(t) { return t.fields; });
          var res = _.each(m1, function(m){ _.each(fields, function(f){ m[f] = m[f][0] }) });
          defer.resolve(res);
        }
        else
          defer.resolve(_.map(result, function(t) { return t._source; }));
      })
      .error(function(data, status, headers, config) {
        defer.reject(status);
        console.log(config);
      });

    return defer.promise;
  }

  this.getById = function(spaceId, id) {
    return $http.get('/api/message/get/' + spaceId + '/' + id)
      .success(function(data, status, headers, config) {
        var result = data;
        return result;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.delete = function(id) {
    return $http.delete('/api/message/delete/' + id)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.save = function(message) {
    return $http.post('/api/message/save', message)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

}]);
