
enyine.service('tagService', ['$http', '$q', function ($http, $q) {

  this.get = function() {
    return $http.get('/tag/get')
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getBySpace = function(id, search, take, skip, fields) {
    var defer = $q.defer();

    var url = '/tag/project/' + id;
    var body ={
      take: take,
      skip: skip,
      search: search ? search : null,
      fields: fields ? fields : null
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

  this.getById = function(projectId, id) {
    return $http.get('/tag/get/' + projectId + '/' + id)
      .success(function(data, status, headers, config) {
        var result = data;
        return result;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.delete = function(id, projectId) {
    var data = {
      id: id,
      projectId: projectId
    }
    return $http.post('/tag/delete/', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.save = function(projectId, tag) {
    tag.projectId = projectId;
    return $http.post('/tag/save', tag)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.addTopicTags = function(projectId, targetQuery, tags) {
    var _tags = _.map(tags, function(t) { return { id: t.id, name: t.name } });
    var data = {
      projectId: projectId,
      tags: _tags,
      targetQuery: targetQuery
    }
    return $http.post('/topic/addTags', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.removeTopicTags = function(projectId, targetQuery, tags) {
    var _tags = _.map(tags, function(t) { return { id: t.id, name: t.name } });
    var data = {
      projectId: projectId,
      tags: _tags,
      targetQuery: targetQuery
    }
    return $http.post('/topic/removeTags', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }


}]);
