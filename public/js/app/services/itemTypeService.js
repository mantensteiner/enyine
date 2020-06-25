
enyine.service('itemTypeService', ['$http', '$q', function ($http, $q) {

  this.get = function() {
    return $http.get('/api/itemtype/get')
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

    var url = '/api/itemtype/search';
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
    return $http.get('/api/itemtype/get/' + spaceId + '/' + id)
      .success(function(data, status, headers, config) {
        var result = data;
        return result;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.delete = function(id, spaceId) {
    return $http.delete('/api/itemtype/delete/' + id)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.save = function(spaceId, label) {
    label.spaceId = spaceId;
    return $http.post('/api/itemtype/save', label)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.buildMarkup = function(labels) {
    var markupItems = [];
    _.each(labels, function(l) {
      var el = {
        id: l.id,
        name:   "<span style='color:" + l.color + "'>" + l.name + "</span>",
        ticked: false
      };

      if(l.icon) {
        el.color =  "<span style='color:" + l.color + "'><i class='" + l.icon + "'></i></span>";
      }
      else {
        el.color =  "<span style='color:" + l.color + "'><i class='fa fa-tag'></i></span>";
      }

      markupItems.push(el);
    })
    return markupItems;
  }

}]);
