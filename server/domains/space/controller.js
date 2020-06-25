var Space = require('./models/space'),
    restful = require('../../restful'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    eventHandler = require('../_shared/eventHandler'),
    AuthorizationError = require('../../utils/errors').AuthorizationError,
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    command = require('../_shared/command');
    

/**
 *  create
 */
module.exports.create = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var fields = (req.query && req.query.fields) ? req.query.fields.split(',') : null;
        return Space({user: req.user, txnId, fields})
        .validate(req.body)
        .then(function(model) {
          return model.add(model.data);
        });
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('create', 'Space', err));        
      }
    });
  }
}

/**
 *  save
 */
module.exports.save = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var fields = (req.query && req.query.fields) ? req.query.fields.split(',') : null;
        return Space({user: req.user, txnId, fields})
        .validate(req.body)
        .then(function(model) {
          return model.save();
        });
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('save', 'Space', err));        
      }
    });
  }
}

/**
 *  get
 */
module.exports.get = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Space({user: req.user})
    .get()
    .then(function(spaces) {
      res.json(spaces);
    })
    .fail(function(err){
      if(err instanceof AuthorizationError) { // already logged 
        return res.status(403).json(errorObjBuilder('get', 'Space', err));
      } 
      res.status(500).json(errorObjBuilder('get', 'Space', err));
    });
  }
}

/**
 *  getById
 */
module.exports.getById = function(req, res){
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Space({user: req.user})
    .getById(req.params.id)
    .then(function(space) {
      res.json(space);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('getById', 'Space', err));
    });
  }
}

/**
 *  delete
 */
module.exports.del = function(req, res){
  restful(req, res, {
    delete: handleDelete
  });
  
  function handleDelete() {
    command(req, res, {
      handler: function(txnId) {
        return Space({user: req.user, txnId:txnId})
        .delete(req.params.id);
      },
      success: function(id) {
        res.json(id);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('delete', 'Space', err));        
      }
    });
  }
}

/**
 *  saveUser
 */
module.exports.saveUser = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var userConfig = req.body;
        var event = eventHandler(req, res, eventSubscriptions, userConfig);
        if(event)
          userConfig.spaceId = event.meta.spaceId;
    
        return Space({user: req.user, txnId: txnId})
        .saveUser(userConfig);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('saveUser', 'Space', err));        
      }
    });
  }
}

/**
 *  removeUser
 */
module.exports.removeUser = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Space({user: req.user, txnId: txnId})
        .removeUser({
          spaceId: req.body.spaceId,
          userId: req.body.userId
        });
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('removeUser', 'Space', err));        
      }
    });
  }
}

/**
 *  getStatus
 */
module.exports.getStatus = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Space({user: req.user, data: {id: req.params.id}})
    .getStatus()
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err) {
      res.status(500).json(errorObjBuilder('getStatus', 'Space', err));
    });
  }
}

/**
 *  saveStatus
 */
module.exports.saveStatus = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Space({user: req.user, txnId: txnId})
        .saveStatus({status: req.body.status, spaceId: req.body.id});
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('saveStatus', 'Space', err));        
      }
    });
  }
}

/**
 *  deleteStatus
 */
module.exports.deleteStatus = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Space({user: req.user, txnId: txnId})
        .deleteStatus({statusId: req.body.statusId, spaceId: req.body.id});
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('deleteStatus', 'Space', err));        
      }
    });
  }
}

/**
 *  getPriorities
 */
module.exports.getPriorities = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Space({user: req.user, data: {id: req.params.id}})
    .getPriorities()
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err) {
      res.status(500).json(errorObjBuilder('getPriorities', 'Space', err));
    });
  }
}

/**
 *  savePriority
 */
module.exports.savePriority = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Space({user: req.user, txnId: txnId})
        .savePriority({priority: req.body.priority, spaceId: req.body.id});
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('savePriority', 'Space', err));        
      }
    });
  }
}

/**
 *  deletePriority 
 */
module.exports.deletePriority = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Space({user: req.user, txnId: txnId})
        .deletePriority({priorityId: req.body.priorityId, spaceId: req.body.id});  
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('deletePriority', 'Space', err));        
      }
    });
  }
}

/**
 *  saveUnit
 */
module.exports.saveUnit = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Space({user: req.user, txnId: txnId})
        .saveUnit({unit: req.body.unit, spaceId: req.body.id});
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('saveUnit', 'Space', err));        
      }
    });
  }
}

/**
 *  deleteUnit
 */
module.exports.deleteUnit = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Space({user: req.user, txnId: txnId})
        .deleteUnit({unitId: req.body.unitId, spaceId: req.body.id});
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('deleteUnit', 'Space', err));        
      }
    });
  }
}

/**
 *  getUnits
 */
module.exports.getUnits = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Space({user: req.user, data: {id: req.params.id}})
    .getUnits()
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err) {
      res.status(500).json(errorObjBuilder('getUnits', 'Space', err));
    });
  }   
}