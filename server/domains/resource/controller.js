var Resource = require('./models/resource'),
    restful = require('../../restful'),
    command = require('../_shared/command'),
    q = require('q'),
    path = require('path'),
    url = require('url'),
    fs = require('fs'),
    log = require('../../utils/logger'),
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    searchQueryParser = require('../_shared/searchRequestQueryParser');

/**
 * Create file upload
 */
module.exports.uploadFile = function (req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var defer = q.defer();
        var file = req.files.file;
      
        if(file.size > 20000000) {
          return res.status(403).json({message: "Max size for files is 200Mb"});
        }
      
        fs.readFile(file.path, {encoding: 'base64'}, function(err,data) {
          if (err) {
            log.error(err, {name: 'api.resource.uploadFile'});
            res.status(500).json(errorObjBuilder('resource', 'Resource', err));
          }
          else {
            Resource({
              user: req.user,
              txnId: txnId,
              data: {
                userId: req.user.userId,
                username: req.user.username,
                data: data,
                contentType: file.type,
                filesize: file.size,
                filename: file.name,
                name: file.name,
                spaceId: req.body.spaceId,
                relations: req.body.relations
              }
            })
            .create()
            .then(function() {
              fs.unlink(file.path, function(err, data) {
                if (err) return defer.reject(err);
                
                return defer.resolve({fileType: file.type});
              });
            })
            .fail(function(err) {
              log.error(err, {name: 'api.resource.uploadFile.create'});
              return defer.reject(err);
            });
          } 
        });
        return defer.promise;
      },
      success: function(result) {
        res.writeHead(200, {'Content-Type': result.fileType});
        res.end();
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('uploadFile', 'Resource', err));        
      }
    });
  }
};

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
        return Resource({user: req.user, txnId: txnId})
          .validateSave(req.body);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('save', 'Resource', err));        
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
        return Resource({user: req.user, txnId: txnId})
          .delete(req.params.id);
      },
      success: function(id) {
        res.json(id);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('delete', 'Resource', err));        
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
    Resource({user: req.user})
    .get()
    .then(function(results) {
      res.json(results);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('get', 'Resource', err));
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
    Resource({user: req.user})
    .getById(req.params.id)
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('getById', 'Resource', err));
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
    Resource({
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
      res.status(500).json(errorObjBuilder('search', 'Resource', err));
    });
  }
}