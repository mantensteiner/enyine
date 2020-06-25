
enyine.service('noteService', ['$http', '$q', function ($http, $q) {
  this.get = function() {
    return $http.get('/api/note/get')
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getBySpace = function(id, search, take, skip, fields) {
    var defer = $q.defer();
    
    var url = '/api/note/search';
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
    return $http.get('/api/note/get/' + spaceId + '/' + id)
      .success(function(data, status, headers, config) {
        var result = data;
        return result;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.delete = function(id, spaceId) {
    return $http.delete('/api/note/delete/' + id)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.save = function(spaceId, note) {
    note.spaceId = spaceId;
    return $http.post('/api/note/save', note)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

}]);
