
enyine.service('itemService', ['$http', '$q', function ($http, $q) {

  this.get = function() {
    return $http.get('/api/item/get')
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getBySpace = function(id, search, take, skip, fields, excludeDone, sortBy, sortDir, aggs, totalHits) {
    var defer = $q.defer();

    var url = '/api/item/search';
    
    var body ={
      take: take,
      skip: skip,
      sortBy: sortBy ? sortBy : null,
      sortDir: sortDir ? sortDir : null,
      query: search ? search: null,
      spaceId: id,
      fields: fields ? fields : null,
      aggs: aggs ? aggs : null
    }

    //if(excludeDone)
    //body.search += "+(!status.name:Done)";

    function mapSource(hits) {
      return _.map(hits, function(t) {
        return t._source;
      });
    }

    $http.post(url, body)
      .success(function(data, status, headers, config) {
        var result = null;
        if( data.hits ) {
          if(!data.aggs && !totalHits) {
            result = mapSource(data.hits.hits);
          }
          else {          
              result = { hits: mapSource(data.hits.hits) };
          }
          if(totalHits) {
            result.total = data.hits.total;         
          }
          if(data.aggs) {
            result.aggs = data.aggs;
          } 
        }

        if(result == null)
          result = [];

        defer.resolve(result);
      })
      .error(function(data, status, headers, config) {
        defer.reject(status);
        console.log(config);
      });

    return defer.promise;
  }

  this.getById = function(spaceId, id) {
    return $http.get('/api/item/get/' + id)
      .success(function(data, status, headers, config) {
        var result = data;
        return result;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.delete = function(id, spaceId) {
    var data = {
      id: id,
      spaceId: spaceId
    }
    return $http.delete('/api/item/delete/' + spaceId + '/' + id)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(data.message);
      });
  }

  this.save = function(topic) {
    if(topic.projectId) {
      topic.spaceId = topic.projectId;
      delete topic.projectId;
    }
      
    return $http.post('/api/item/save', topic)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.saveComment = function(spaceId, id, comment, commentId) {

    var data = {
      spaceId: spaceId,
      id: id,
      comment: comment,
      commentId: commentId
    }

    return $http.post('/api/item/saveComment', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.deleteComment = function(spaceId, id, commentId) {
    var data = {
      spaceId: spaceId,
      id: id,
      commentId: commentId
    }
    return $http.post('/api/item/deleteComment', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.addRelations = function(spaceId, targetQuery, sourceQuery) {
    var data = {
      spaceId: spaceId,
      targetQuery: targetQuery,
      sourceQuery: sourceQuery
    }
    return $http.post('/api/item/addRelations', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.removeRelations = function(spaceId, targetQuery, sourceQuery) {
    var data = {
      spaceId:spaceId,
      targetQuery: targetQuery,
      sourceQuery: sourceQuery
    }
    return $http.post('/api/item/removeRelations', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.saveBulkData = function(spaceId, targetQuery, bulkData) {
    var data = {
      spaceId: spaceId,
      targetQuery: targetQuery,
      bulkData: bulkData
    }
    return $http.post('/api/item/saveBulkData', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

}]);
