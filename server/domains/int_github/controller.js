var GithubSpace = require('./models/githubSpace'),    
    GithubReceive = require('./models/githubReceive'),    
		config = require('../../config')(),
		restful = require('../../restful'),
    command = require('../_shared/command'),
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    searchQueryParser = require('../_shared/searchRequestQueryParser');

/**
 * 	receive
 */
exports.receive = function(req, res) {
  if(!req.headers["x-hub-signature"]) {
    return res.status(400).json(errorObjBuilder('receive', 'Int_Github', 
      new Error("x-hub-signature header which is mandatory not provided")));
  }

	var githubReceive = GithubReceive({
		user: config.auth.systemUser // no user expected, system-request
	});
	githubReceive.validateRequest(req.headers, req.body)
	.then(function(gitSpace) {
		return githubReceive.executeTriggerType(req.headers, req.body);
	})
	.then(function(result) {
		res.json(result);
	})
	.fail(function(err) {
		res.status(500).json(err);
	});  	
}


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
        return GithubSpace({user: req.user,txnId})
        .validateSave(req.body);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('save', 'GithubSpace', err));        
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
        return GithubSpace({user: req.user, txnId})
        .delete(req.params.id);
      },
      success: function(id) {
        res.json(id);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('delete', 'GithubSpace', err));        
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
    GithubSpace({user: req.user})
    .get()
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('get', 'GithubSpace', err));
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
    GithubSpace({user: req.user})
    .getById(req.params.id)
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('getById', 'GithubSpace', err));
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
    GithubSpace({user: req.user})
    .search(query)
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('search', 'GithubSpace', err));
    });
  }
}