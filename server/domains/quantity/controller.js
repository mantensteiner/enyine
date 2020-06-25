var Quantity = require('./models/quantity'),
    restful = require('../../restful'),
    command = require('../_shared/command'),
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    searchQueryParser = require('../_shared/searchRequestQueryParser');

/**
 *  import
 */
exports.import = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return Quantity({unauthenticatedOperation: true, txnId})
        .import(req.body);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('save', 'Quantity', err));        
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
        return Quantity({unauthenticatedOperation: true, txnId})
          .delete(req.params.id);
      },
      success: function(id) {
        res.json(id);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('delete', 'Quantity', err));        
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
    Quantity({user: req.user})
    .get()
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('get', 'Quantity', err));
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
    Quantity({user: req.user})
    .getById(req.params.id)
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('getById', 'Quantity', err));
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
    Quantity({
      user: req.user,
      skip: req.body.skip,
      take: req.body.take,
      aggs: req.body.aggs
    })
    .search(query)
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('search', 'Quantity', err));
    });
  }
}