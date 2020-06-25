var Commit = require('./models/commit'),
    restful = require('../../restful'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    eventHandler = require('../_shared/eventHandler'),
    command = require('../_shared/command'),
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    searchQueryParser = require('../_shared/searchRequestQueryParser');
    
/**
 *  save
 */
exports.save = function(req, res) {
  restful(req, res, {
    put: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var event = eventHandler(req, res, eventSubscriptions);
        return Commit({user: req.user, txnId})
        .validateSave(event.snapshot);
      },
      success: function(space) {
        res.json(space);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('save', 'VCS', err));        
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
        return Commit({user: req.user})
        .delete(req.params.id);
      },
      success: function(id) {
        res.json(id);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('delete', 'VCS', err));        
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
    Commit({user: req.user})
    .get()
    .then(function(spaces) {
      res.json(spaces);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('get', 'VCS', err));
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
    Commit({user: req.user})
    .getById(req.params.id)
    .then(function(space) {
      res.json(space);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('getById', 'VCS', err));
    });
  }
}