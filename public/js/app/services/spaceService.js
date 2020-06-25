
enyine.service('spaceService', ['$http', function ($http) {

  this.get = function() {
    return $http.get('/api/space/get')
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getById = function(id) {
    return $http.get('/api/space/get/' + id)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }


  this.create = function(project) {
    return $http.post('/api/space/create', project)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }
  
  this.save = function(project) {
    return $http.post('/api/space/save', project)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.delete = function(spaceId) {
    var data = {
      id: spaceId
    }
    return $http.delete('/api/space/delete/' + data.id)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.searchUser = function(input, spaceId) {
    var data = {
      input: input,
      spaceId: spaceId
    }
    return $http.post('/api/space/searchUser/', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.removeUser = function(spaceId, userId) {
    var data = {
      userId: userId,
      spaceId: spaceId
    }
    return $http.post('/api/space/removeUser/', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }


  this.inviteUser = function(username, spaceId, invitationFrom) {
    var data = {
      username: username,
      spaceId: spaceId,
      invitationFrom: invitationFrom
    }
    return $http.post('/api/space/sendInvite/', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.confirmJoin = function(token, confirm) {
    var data = {
      token: token,
      confirm: confirm
    }
    return $http.post('/api/space/confirmJoin/', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getByInvitationToken = function(token) {
    return $http.get('/api/space/getByInvitationToken/' + token)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getActions = function(id, query, take, skip) {
    var data = {
      spaceId: id,
      query: query,
      take: take,
      skip: skip
    }
    return $http.post('/api/event/search/', data)
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

  // Status
  this.saveStatus = function(spaceId, status) {
    var data = {
      id: spaceId,
      status: status
    }
    return $http.post('/api/space/saveStatus', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }


  this.deleteStatus = function(spaceId, statusId) {
    var data = {
      id: spaceId,
      statusId: statusId
    }
    return $http.post('/api/space/deleteStatus', data)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }
  
  this.getStatus = function(spaceId) {
    return $http.get('/api/space/getStatus/'+spaceId)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }
  
  // Priority
  this.savePriority = function(spaceId, priority) {
      var data = {
        id: spaceId,
        priority: priority
      }
      return $http.post('/api/space/savePriority', data)
      .success(function(data, priority, headers, config) {
        return data;
      })
      .error(function(data, priority, headers, config) {
        console.log(config);
      });
  }
  

  this.deletePriority = function(spaceId, priorityId) {
    var data = {
      id: spaceId,
      priorityId: priorityId
    }
    return $http.post('/api/space/deletePriority', data)
      .success(function(data, priority, headers, config) {
        return data;
      })
      .error(function(data, priority, headers, config) {
        console.log(config);
      });
  }

  this.getPriorities = function(spaceId) {
    return $http.get('/api/space/getPriorities/'+spaceId)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }
}]);
