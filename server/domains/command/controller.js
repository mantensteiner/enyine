var Command = require('./models/command'),
    restful = require('../../restful');

/**
 *  get
 */
module.exports.get = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Command({user: req.user})
    .get()
    .then(function(_commands) {
      return res.json(_commands);
    }, function(err) {
      return res.status(500).json({message: err.messsage});      
    });
  }
}

/**
 *  getById
 */
module.exports.getById = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Command({user: req.user})
    .findOne({id:req.params.id})
    .then(function(_command) {
      return res.json(_command);
    }, function(err){
      return res.status(500).json({message: err.messsage});
    });
  }  
}

/**
 *  getBySpace
 */
module.exports.getBySpace = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    var command = Command({user: req.user, fields: req.body.fields});
    command.sortField = 'modifiedOn';
    command.sortDir = "desc";
    command.take = req.body.take ? req.body.take : 50;
    command.skip = req.body.skip ? req.body.skip : 0;
  
    var query = "+(spaceId:"+req.params.id + ")" + " +(_missing_:users OR users:" + req.user.id + ")";
    if(req.body.search) {
      query += " +(" + req.body.search + ")";
    }
  
    command.search(query)
    .then(function(_commands) {
      return res.json(_commands);
    }, function(err){
      return res.status(500).json({message: err.messsage});
    });
  }
}

/**
 *  search
 */
module.exports.search = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    var command = Command({user: req.user});
    if(req.body.skip)
      command.skip = req.body.skip;
    if(req.body.take)
      command.take = req.body.take;
  
    var query = req.body.query;
    if(req.body.spaceId) {
      query = "+(spaceId:" +req.body.spaceId + ") ";
      query += "+(" + req.body.query + ")";
    }
  
    var aggs = req.body.aggs;
  
    command.search(query, aggs)
    .then(function(result) {
      return res.json(result);
    }, function(err){
      return res.status(500).json({message: err.messsage});
    });
  }
}