
var User = require('./models/user'),
    Avatar = require('./models/avatar'),
    restful = require('../../restful'),
    path = require('path'),
    url = require('url'),
    q = require('q'),
    fs = require('fs'),
    log = require('../../utils/logger'),
    eventHandler = require('../_shared/eventHandler'),
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    command = require('../_shared/command'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    config = require('../../config')();

/**
 *  createFromAccount
 */
module.exports.createFromAccount = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    var event = eventHandler(req, res, eventSubscriptions);
    User({ 
      user: req.user,
      //txnId: txnId
    })
    .createFromAccount(event.formattedData)
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err) {
      res.status(500).json(errorObjBuilder('createFromAccount', 'User', err));
    });
    
    // ToDo: Resolve/dismiss issue
    // Problem with Command: no transaction id present from account-action
    /* 
    command(req, res, {
      handler: function(txnId) {
        var event = eventHandler(req, res, eventSubscriptions);
        return User({ 
          user: req.user,
          txnId: txnId
        })
        .createFromAccount(event.formattedData);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('createFromAccount', 'User', err));        
      }
    });*/
  }
} 

/**
 *  save
 */
module.exports.save = function(req, res) {
  restful(req, res, {
    put: handlePut
  });
  
  function handlePut() {
    command(req, res, {
      handler: function(txnId) {
        var userData = req.body;
        eventHandler(req, res, eventSubscriptions, userData);
        return User({ 
          user: req.user,
          txnId: txnId,
          data: userData
        })
        .save();
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('save', 'User', err));        
      }
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
    var user = User({user: req.user});
  
    user.getById(req.params.id)
    .then(function(_user) {
      res.json(_user);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('getById', 'User', err));
    });
  }
}

/**
 *  search
 */
module.exports.search = function(req, res) {
  restful(req, res, {
    post: handePost
  });
  
  function handePost() {
    var user = User({user: req.user});
  
    user.search(req.body.query)
    .then(function(users) {
      res.json(users);
    })
    .fail(function(err){
      res.status(500).json(errorObjBuilder('search', 'User', err));
    });
  }
}

/**
 * Create file upload
 */
module.exports.uploadAvatar = function (req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var defer = q.defer();
        var file = req.files.file;
      
        if(file.size > 200000) {
          return res.status(403).json({message: "Max size for avatars is 200kb"});
        }
      
        fs.readFile(file.path, {encoding: 'base64'}, function(err,data) {
          if (err) {
            log.error(err, {name: 'api.user.uploadAvatar'});
            res.status(500).json(errorObjBuilder('uploadAvatar', 'User', err));
          }
          else {
            Avatar({
              user: req.user,
              txnId: txnId,
              data: {
                userId: req.user.userId,
                username: req.user.username,
                data: data,
                contentType: file.type,
                size: file.size,
                name: file.name,
                uploadedOn: new Date()
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
              log.error(err, {name: 'api.user.uploadAvatar.create'});
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
        res.status(500).json(errorObjBuilder('uploadAvatar', 'User', err));        
      }
    });
  }
};

/**
 *  getAvatar
 */
module.exports.getAvatar = function (req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    var id = req.params.id;
    var username = req.query.username;
  
    if(id && !username) {
      getAvatar(id);
    }
    else if(username) {
      getAvatar(null, username);
    }
    else {
      res.json({message:"No userId or username provided."}, 500);    
    }
  
    function getAvatar(uId, username) {
      var query = "";
      if(uId)
        query = "userId:" + uId;
      else if(username)
        query = "username:" + username;
      
      Avatar({
        user: req.user || config.auth.systemUser,
        sortField: 'uploadedOn',
        sortDir: 'desc',
        take: 1
      })
      .search(query)
      .then(function(avatars) {
        var resultImage = avatars.hits.hits[0]._source;
        var decodedImage = new Buffer(resultImage.data, 'base64');
        res.writeHead(200, {'Content-Type': resultImage.contentType});
        res.end(decodedImage);
      })
      .fail(function(err){
        res.status(500).json(errorObjBuilder('getAvatar', 'User', err));
      });
    }
  }
}

/**
 *  saveSpaceMembers
 */
module.exports.saveSpaceMembers = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {  
    command(req, res, {
      handler: function(txnId) {
        var event = eventHandler(req, res, eventSubscriptions);
        return User({
          user: req.user,
          txnId: txnId
        })
        .saveSpaceMembers(event.formattedData);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('saveSpaceMembers', 'User', err));        
      }
    });
  }
}

/**
 *  removeSpaceFromMembers
 */
module.exports.removeSpaceFromMembers = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {  
    command(req, res, {
      handler: function(txnId) {
        var event = eventHandler(req, res, eventSubscriptions);
        return User({
          user: req.user,
          txnId: txnId
        })
        .removeSpaceFromMembers(event.formattedData);
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('removeSpaceFromMembers', 'User', err));        
      }
    });
  }
}

/**
 *  sendSpaceInvite
 */
module.exports.sendSpaceInvite = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        return User({user: req.user, txnId: txnId})
        .sendSpaceInvite({
          spaceId: req.body.spaceId,
          invitationFrom: req.body.invitationFrom
        });
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('sendSpaceInvite', 'User', err));        
      }
    });
  }
}

/**
 *  confirmJoin
 */
module.exports.confirmJoin = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {  
    command(req, res, {
      handler: function(txnId) {
        return User({user: req.user, txnId: txnId})
        .confirmJoinToSpace({
          token: req.body.token,
          confirm: req.body.confim
        });
      },
      success: function(result) {
        res.json(result);
      },
      fail: function(err) {
        res.status(500).json(errorObjBuilder('confirmJoin', 'User', err));        
      }
    });
  }
}


// ToDo: check if these are still needed

/*
exports.getBySpaceInvitationToken = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {  
    User({user: req.user})
    .confirmJoinToSpace({
      token: req.body.token,
      confirm: req.body.confim
    })
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err) {
      res.status(500).json(err);        
    });
  }
    
  var space = new Space(req.user);
  var user = new User(req.user);
  var token = req.params.token;

  user.findOne({"spaceInvitations.token":token}).then(function(_user) {
    if(!_user) {
      res.json({message:"No user with pending invitation token " + token + " found."}, 404);
      return;
    }

    var invitation = _.findWhere(_user.spaceInvitations,{ token: token });
    space.findOne({id:invitation.spaceId}).then(function(space) {
        res.json(space);
        return;
      },
      function(err){
        res.json(err, 500);
        return;
      });

  },function(err){
    res.json({message:err.message}, err.code ? err.code*1 : 500);    
  });
}
*/


/*
exports.searchUser = function(req,res) {
  var user = new User(req.user);

  var spaceId = req.body.spaceId;
  var input = req.body.input;
  var query = "username:" + input + " OR email:" + input;

  // better done in user-domain

  user.search(query).then(function(users) {
      var result = {found:false, username:null};

      if(users.hits && users.hits.total === 1) {
        var _user = users.hits.hits[0];
        var userIsInSpace = _.findWhere(_user._source.spaces,{ id: spaceId });

        if(userIsInSpace) {
          result.message = "User is already a member in this space!";
          res.json(result, 403);
          return;
        }

        var pendingInvitation = _.findWhere(_user._source.spaceInvitations, { spaceId: spaceId });
        if(pendingInvitation) {
          result.message = "There is already an invitation pending for this user and space!";
          res.json(result, 403);
          return;
        }

        // Return empty result if user has invitations disabled
        if(!_user._source.acceptInvitations) {
          res.json(result);
          return;
        }

        result.found = true;
        result.username = _user._source.username;
      }

      res.json(result);
    },
    function(err){
      res.json({message:err.message}, err.code ? err.code*1 : 500);      
    });
}
*/


/*
exports.getMembers = function(req,res) {
  var user = new User(req.user);
  var space = new Space(req.user);
  
  // better done in user domain
  // only get users if authorized to read from this space (spacePolicy)

  // Get space for request authorization
  space.findOne({id:req.body.spaceId}, true).then(function(_space) {
      if(!_space) {
        res.json({message:"Space not found."}, 404);
        return;
      }

      user.search({"spaces.id":_space.id}).then(function(users) {
          res.json(users);
        },
        function(err){
          res.json(err, 500);
        });
    },
    function(err){
      res.json({message:err.message}, err.code ? err.code*1 : 500);
    });
}

 */