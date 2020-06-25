
enyine.service('valueService', ['$http', function ($http) {

  this.get = function() {
    return $http.get('/api/value/get')
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getById = function(spaceId, id) {
    return $http.get('/api/value/get/' + id)
      .then(function(result) {
        return result.data;
      }, function(err) {
        console.log(err);
      });
  }

  this.search = function(spaceId, query, aggs, take, skip) {
    var body = {
      spaceId: spaceId,
      query:query,
      aggs: aggs,
      take: take,
      skip: skip
    };
    return $http.post('/api/value/search', body)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.delete = function(id) {
    return $http.delete('/api/value/delete/' + id)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.save = function(value, unit, fields) {
    if(unit)
      value.unit = {
        id: unit.id,
        symbol: unit.symbol
      };

    var url = '/api/value/save' + (fields ? '?fields=' + fields.toString() : '');

    return $http.post(url, value)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.autoCompleteComment = function(text) {
    return $http.get('/api/value/autoCompleteComment/' + text)
      .then(function(data) {
        return data.data.suggester[0];
      },function(err) {
        console.log(err);
      });
  }
}]);
