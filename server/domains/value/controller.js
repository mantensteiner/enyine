var Value = require('./models/value'),
    restful = require('../../restful'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    command = require('../_shared/command'),
    searchQueryParser = require('../_shared/searchRequestQueryParser'),
    eventHandler = require('../_shared/eventHandler');    
    
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
        var event = eventHandler(req, res, eventSubscriptions);
        var fields = (req.query && req.query.fields) ? req.query.fields.split(',') : null;
        return Value({user: req.user, txnId, skipAuth: event.skipAuth, fields})
        .validateSave(event.formattedData);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('save', 'Value', err));        
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
        return Value({user: req.user, txnId})
        .delete(req.params.id);
      },
      success: function(id) {
        res.json(id);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('delete', 'Value', err));        
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
    Value({user: req.user})
    .get()
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('get', 'Value', err));
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
    Value({user: req.user})
    .getById(req.params.id)
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('getById', 'Value', err));
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
    Value({
      user: req.user,
      skip: req.body.skip,
      take: req.body.take
    })
    .search(query, req.body.aggs)
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('search', 'Value', err));
    });
  }
}

/**
 *  removeItem
 */
exports.removeItem = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var event = eventHandler(req, res, eventSubscriptions);
        return Value({user: req.user, txnId})
        .removeItem(event.formattedData);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('removeItem', 'Value', err));        
      }
    });
  }
}

/**
 *  autoCompleteComment
 *
exports.autoCompleteComment = function(req,res){
  var value = new Value(req.user);

  // get all values for space-index
  value.autoComplete(req.params.text, "suggestComment").then(function(result) {
      res.json(result);
    },
    function(err){
      res.json(err, 500);
    });
}
 */