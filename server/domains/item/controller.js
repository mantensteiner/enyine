var Item = require('./models/item'),
    restful = require('../../restful'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    command = require('../_shared/command'),
    eventHandler = require('../_shared/eventHandler'),
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    searchQueryParser = require('../_shared/searchRequestQueryParser');
    //Value = require('../value/models/value'); // ToDo: Refactor values (remove dependency, event registration)

/**
 *  save
 */
exports.save = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var fields = (req.query && req.query.fields) ? req.query.fields.split(',') : null;
        return Item({user: req.user, txnId, fields})
        .validateSave(req.body);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('save', 'Item', err)); 
      }
    });
  }
}

/**
 *  delete
 */
exports.del = function(req, res){
  restful(req, res, {
    delete: handleDelete
  });
  
  function handleDelete() {
    command(req, res, {
      handler: function(txnId) {
        return Item({user: req.user, txnId, data: {spaceId: req.params.spaceId}})
        .delete(req.params.id);
      },
      success: function(id) {
        res.json(id);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('delete', 'Item', err)); 
      }
    });
  }
}


/**
 *  get
 */
exports.get = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Item({user: req.user})
    .get()
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('get', 'Item', err));
    });
  }
}

/**
 *  getById
 */
exports.getById = function(req, res){
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Item({user: req.user})
    .getById(req.params.id) //, spaceId: req.params.spaceId})
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('getById', 'Item', err));
    });
  }
}

/**
 *  search
 */
exports.search = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    var query = searchQueryParser(req);
    Item({
      user: req.user,
      skip: req.body.skip,
      take: req.body.take,
      sortField: req.body.sortBy,
      sortDir: req.body.sortDir
    })
    .search(query, req.body.aggs)
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('search', 'Item', err));
    });
  }
}

/**
 *  getEventItems
 */
exports.getEventItems = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    var query = 'item.hasDate:true'; // filter by status, e.g. 'active' +(!topic.status.id:5)';
    var item = Item({user: req.user, sortField: 'date', sortDir: 'desc'});
    item.search(query)
    .then(function(result) {
      res.json(item.unwrapResultRecords(result));
    })
    .fail(function(err) {
      res.status(500).json(errorObjBuilder('getEventItems', 'Item', err));
    });
  }
}

/**
 *  submit
 */
exports.submit = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    if(!req.params.id || (!req.query.url && !req.query.title)) 
      return res.status(500).json(errorObjBuilder('submit', 'Item', new Error('No space id or url specified.')));
      
    var url = req.query.url;
    var newItem = {
      spaceId: req.params.id,
      comment: "<a target='_blank' href=" + req.query.url + ">" + req.query.url + "</a>",
      ressources: [{
        id: 1,
        modifiedOn: new Date(),
        name: req.query.title,
        link: req.query.url
      }],
      name: req.query.title
    }
    
    Item({
      user: req.user,
      data: newItem
    })
    .validateSave(req.body)
    .then(function(result) {
      res.set('Content-Type', 'text/html');
      res.send('<script>alert("Added link to space in enyine!");window.location.href="'+url+'";</script>');
      res.end();
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('submit', 'Item', err));
    });
  }
}

/**
 *  addRelations
 */
exports.addRelations = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Item({user: req.user, txnId: txnId})
        .addRelations({
          spaceId: req.body.spaceId, 
          targetQuery: req.body.targetQuery, 
          sourceQuery: req.body.sourceQuery
        });
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('addRelations', 'Item', err)); 
      }
    });
  }
}

/**
 *  removeRelations
 */
exports.removeRelations = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Item({user: req.user, txnId: txnId})
        .removeRelations({
          spaceId: req.body.spaceId, 
          targetQuery: req.body.targetQuery, 
          sourceQuery: req.body.sourceQuery
        });
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('removeRelations', 'Item', err)); 
      }
    });
  }
}

/**
 *  saveBulkData
 */
exports.saveBulkData = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Item({user: req.user, txnId: txnId})
        .saveBulkData({
          spaceId: req.body.spaceId, 
          targetQuery: req.body.targetQuery, 
          bulkData: req.body.bulkData
        });
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('saveBulkData', 'Item', err)); 
      }
    });
  }
}

/**
 *  addTags
 */
exports.addTags = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Item({user: req.user, txnId: txnId})
        .addTags({
          spaceId: req.body.spaceId, 
          targetQuery: req.body.targetQuery, 
          tags: req.body.tags
        });
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('addTags', 'Item', err)); 
      }
    });
  }
}

/**
 *  removeTags
 */
exports.removeTags = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Item({user: req.user, txnId: txnId})
        .removeTags({
          spaceId: req.body.spaceId, 
          targetQuery: req.body.targetQuery, 
          tags: req.body.tags
        });
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('removeTags', 'Item', err)); 
      }
    });
  }
}

/**
 *  saveIssue
 */
exports.saveIssue = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var event = eventHandler(req, res, eventSubscriptions);
        return Item({user: req.user, txnId: txnId})
        .saveIssue(event.formattedData);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('saveIssue', 'Item', err)); 
      }
    });
  }
}
