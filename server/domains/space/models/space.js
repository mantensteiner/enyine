var BaseModel = require('../../_shared/baseModel'), 
    spacePolicies = require('../../_shared/spacePolicies'),
    eventNamespaces = require('../../_shared/eventNamespaces'),
    idGen = require('../../../utils/idGen'), 
    log = require('../../../utils/logger'), 
    ValidationError = require('../../../utils/errors').ValidationError, 
    modelDefinition = require('../config/mapping').space.properties,
    modelShaper = require('../../_shared/modelShaper'),
    q = require('q'), 
    _ = require('underscore'),
    deletePriority = require('../logic/deletePriority'), 
    savePriority = require('../logic/savePriority'), 
    saveStatus = require('../logic/saveStatus'), 
    deleteStatus = require('../logic/deleteStatus'), 
    saveUnit = require('../logic/saveUnit'), 
    deleteUnit = require('../logic/deleteUnit');
    
module.exports = function (modelConfig) {
  this.new = function() {
    var self = this;  
    // init 
    var model = BaseModel.create({
        index: "space",
        type: "space",
        policy: spacePolicies.spaceMemberPolicy,
        id: modelConfig.spaceId ? modelConfig.spaceId : null,
        sortField: "modifiedOn",
        sortDir: "desc"
    }, modelConfig);
    
    // model.default
    model.defaults = {
      status: [
            { id: 1, name: "Open" },
            { id: 2, name: "Done" }
        ],
      units: [
            { id: 1, name: "Time" }
        ],
      priorities: [
            { id: 1, name: "High" },
            { id: 2, name: "Low" }
        ]
    }
    
    // model.validate
    model.validate = function(modelData) {
      return q.fcall(function () { 
        model.data = modelShaper({definition: modelDefinition, data: modelData}); 
        return model; 
      });
    }

    // model.add, sets default user and pushes spaceCreated event
    model.add = function(addConfig) {
       var defer = q.defer();
       var user = addConfig.user || model.user;
       user.admin = true; // set first user as admin
       model.data = addConfig;
       model.data.users = [user];
       // fire spaceCreate event
       model.namespaces.push(eventNamespaces.spaceCreated);
       model.create()
       .then(function(space) {
         defer.resolve(space);
       })
       .fail(function(err) {
         log.error(err, {name: 'space.add', addConfig: addConfig});
         defer.reject(err);
       });
       
       return defer.promise;
    }

    // model.addUser
    model.saveUser = function(userConfig) {
       var defer = q.defer();
       var spaceId = userConfig.spaceId || model.data.id;
       model.getById(spaceId)
       .then(function(space) {
         var spaceUser = _.findWhere(space.users, {id: userConfig.userId});
         if(!spaceUser) {
           space.users.push({
             id: userConfig.userId,
             username: userConfig.username,
             admin: userConfig.admin
           });
           
         }
         else {
           // Update, only admin setting may change
           spaceUser.admin = userConfig.admin;
         }
         
         model.data = {
           id: spaceId,
           users: space.users
         }
         return model.save();
       })
       .then(function() {
         defer.resolve();
       })
       .fail(function(err) {
         log.error(err, {name: 'space.saveUser', userConfig: userConfig});
         defer.reject(err);
       });
       
       return defer.promise;
    }
        
    // model.removeUser
    model.removeUser = function(removeConfig) {
       var defer = q.defer();
       
       model.getById(removeConfig.spaceId)
       .then(function(space) {
         if(space.users.length === 1)
           throw new Error("The last user of a space cannot remove himself");
          
         var userList = _.without(space.users, _.findWhere(space.users, {id: removeConfig.userId}));
         var inst = self.new();
         inst.data = {
           id: removeConfig.spaceId,
           users: userList
         };
         if(removeConfig.userId == model.user.id)
           inst.skipAuth = true; // authenticated user must be able to remove himself from a project
         return inst.save();
       })
       .then(function() {
         defer.resolve();
       })
       .fail(function(err) {
         log.error(err, {name: 'space.removeUser', removeConfig: removeConfig});
         defer.reject(err);
       });
       
       return defer.promise;
    }
    
    // model.savePriority 
    model.savePriority = function(config) {
      config.user = model.user;
      config.txnId = model.txnId;      
      return savePriority(config);
    }
    
    // model.deletePriority
    model.deletePriority = function(config) {
      config.user = model.user;
      config.txnId = model.txnId;      
      return deletePriority(config);
    }
    
    // model.getPriorities
    model.getPriorities = function () {
      var defer = q.defer();
      if(!model.data.id) 
        return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });
                  
      self.new()
      .getById(model.data.id)
      .then(function(_space) {
        defer.resolve(_space.priorities ? _.sortBy(_space.priorities, 'id') : []); 
      }, function(err) {
        defer.reject(err);
      });
      return defer.promise;
    }
    
    // model.saveStatus 
    model.saveStatus = function(config) {
      config.user = model.user;
      config.txnId = model.txnId;
      return saveStatus(config);
  }
    
    // model.deleteStatus 
    model.deleteStatus = function(config) {
      config.user = model.user;
      config.txnId = model.txnId;      
      return deleteStatus(config);
    }
       
    // model.getStatus 
    model.getStatus = function () {
        var defer = q.defer();
        if(!model.data.id) 
          return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });
        
        self.new()
        .getById(model.data.id)
        .then(function(_space) {
          defer.resolve(_space.status ? _.sortBy(_space.status, 'id') : []); 
        },
        function(err){
          defer.reject(err);
        });
        
        return defer.promise;
    }
    
    // model.saveUnit 
    model.saveUnit = function(config) {
      config.user = model.user;
      config.txnId = model.txnId;      
      return saveUnit(config);
    }
    
    // model.deleteUnit
    model.deleteUnit = function(config) {
      config.user = model.user;
      config.txnId = model.txnId;      
      return deleteUnit(config);
    }
       
    // model.getUnits
    model.getUnits = function () {
        var defer = q.defer();
        if(!model.data.id) 
          return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });
        
        self.new()
        .getById(model.data.id)
        .then(function(_space) {
          defer.resolve(_space.units ? _.sortBy(_space.units, 'id') : []); 
        },
        function(err){
          defer.reject(err);
        });
        return defer.promise;
    }
    
    return model;
  }
  return this.new();
};
