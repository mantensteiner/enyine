var ValueType = require('./models/valuetype'),
    restful = require('../../restful'),
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    command = require('../_shared/command'),
    searchQueryParser = require('../_shared/searchRequestQueryParser');
    
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
        return ValueType({
          user: req.user,
          txnId
        })
        .validateSave(req.body);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).send(errorObjBuilder('save', 'ValueType', err).message);
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
        return ValueType({user: req.user, txnId})
        .validateDelete(req.params.id);
      },
      success: function(id) {
        res.json(id);
      },
      fail: function(err) {
        res.status(500).send(errorObjBuilder('delete', 'ValueType', err).message);
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
    ValueType({user: req.user})
    .get()
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).send(errorObjBuilder('get', 'ValueType', err).message);
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
    ValueType({user: req.user})
    .getById(req.params.id)
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err){
      res.status(500).send(errorObjBuilder('getById', 'ValueType', err).message);
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
    ValueType({
      user: req.user,
      skip: req.body.skip,
      take: req.body.take
    })
    .search(query, req.body.aggs)
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).send(errorObjBuilder('search', 'ValueType', err).message);
    });
  }
}