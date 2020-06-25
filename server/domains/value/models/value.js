var BaseModel = require('../../_shared/baseModel'),
    apiRegistry = require('../../_shared/apiRegistry'),
    ValidationError = require('../../../utils/errors').ValidationError,
    log = require('../../../utils/logger'),
    spacePolicies = require('../../_shared/spacePolicies'),
    modelDefinition = require('../config/mapping').value.properties,
    modelShaper = require('../../_shared/modelShaper'),
    q = require('q'),
    _ = require('underscore');

module.exports = function(modelConfig) {
  this.new = function() {
    var self = this;
        
    var model = BaseModel.create({
      index: "value",
      type: "value",
      policy: spacePolicies.spaceMemberPolicy,
      sortField: "date",
      sortDir: "desc"
    }, modelConfig);
  
    // model.validate
    model.validate = function(modelData) {
      if(!modelData.spaceId && !modelData.userId) 
        return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });
        
      // non-peristed data in this model
      model.eventMetaData = {
        token: modelData.token,
        committer: modelData.committer
      }
        
      return q.fcall(function () { return modelShaper({definition: modelDefinition, data: modelData}); });
    }
   
    // model.validateSave
    model.validateSave = function(modelData) {
      var defer = q.defer();
      
      model.validate(modelData) // validate
      .then(function(data) {
        // Set default responsible user
        if(!data.responsible && model.user) {
          data.responsible = {
            id: model.user.id,
            username: model.user.username
          }
        }
        
        model.data = data;
        
        if(model.eventMetaData.token) { // fetch items for the token from the item-domain
          var innerDefer = q.defer();
          var itemDomain = apiRegistry.getDomain('item');
          itemDomain.search('token:'+model.eventMetaData.token)
          .then(function(result) {
            innerDefer.resolve(result);
          })
          .fail(function(err) {
            log.error(err, {name: 'value.validateSave.itemDomain.search', eventMetaData: model.eventMetaData});
            innerDefer.resolve([]); // do not fail here, just log error (non-critical operation)
          });
          return innerDefer.promise;
        }
        else {
          return q.fcall(function() { return []; });
        }
      })
      .then(function(tokenItems) { // set item-relations (if set)
        tokenItems = model.unwrapResultRecords(tokenItems);
        if(tokenItems.length > 0) {
          _.each(tokenItems, function(ti) {
            var itemAlreadyRelated = _.findWhere(model.data.items, {id: ti.id});
            if(!itemAlreadyRelated) 
              model.data.items.push({
                id: ti.id,
                itemTypeId: ti.itemTypeId
              });
          });
        }
        return q.fcall(function() { return; });
      })
      .then(function() { // fetch users/alias-users from the user-domain
        if(model.eventMetaData.committer) {
          var innerDefer = q.defer();
          var userDomain = apiRegistry.getDomain('user', model.user);
          // ToDo: implement a getByAlias in userdomain to avoid to have to know about internal structures
          // like 'aliasNames'
          var userQuery = 'username:'+ model.eventMetaData.committer.username + 
          ' OR aliasNames.name:' + model.eventMetaData.committer.username; // Aliasnames.source?
          userDomain.search(userQuery)
          .then(function(result) {
            innerDefer.resolve(result);
          })
          .fail(function(err) {
            log.error(err, {name: 'value.validateSave.userDomain.search', eventMetaData: model.eventMetaData});
            innerDefer.resolve([]); // do not fail here, just log error (non-critical operation)
          });
          return innerDefer.promise;
        }
        else {
          return q.fcall(function() { return []; });
        }
      })
      .then(function(users) { // set responsible user
        users = model.unwrapResultRecords(users);
        if(users.length === 1) {
          var user = users[0];
          model.data.responsible = {
            id: user.id,
            username: user.username
          }
        };
        if(!model.data.id) {
          return model.create();
        }
        else {
          return model.save();
        }
      })
      .then(function(result) { // success
        return defer.resolve(result);
      })
      .fail(function(err) { // error
        log.error(err, {name: 'value.validateSave', modelData: modelData});
        return defer.reject(err);
      });
      
      return defer.promise;
    }

    // model.removeItem    
    model.removeItem = function(removeConfig) {
      var self = this;
      var defer = q.defer();
                  
      if(!removeConfig.itemId) 
        return q.fcall(function () { throw new ValidationError('itemId missing.'); });
      if(!removeConfig.spaceId)
        return q.fcall(function () { throw new ValidationError('spaceId missing.'); });
        
      var query = 'items.id:' + removeConfig.itemId + " AND spaceId:" + removeConfig.spaceId;
      model.search(query)
      .then(function(results) {   
        results = model.unwrapResultRecords(results);    
        var cnt = results.length;

        if(cnt === 0) {
            return defer.resolve();
        }

        _.each(results, function(record) {
          var items = _.without(record.items, _.findWhere(record.items, {id:removeConfig.itemId}));
          model.data = {
            id: record.id,
            items: items
          }
          model.save()
          .then(function(result) {
            cnt--;
            if(cnt === 0)
              return defer.resolve();
          })
          .fail(function(err) {
            return defer.reject(err);
          });
        });
      })
      .fail(function(err){
        defer.reject(err);
      });
      
      return defer.promise;    
    }
    
    // normally done in beforeSave,Create
    // still needed?
    /*
    function setSuggestComment() {
      if(model.attributes.comment) {
        model.attributes.suggestComment = {
          input: model.attributes.comment.split(' '),
          output: model.attributes.comment,
          payload: { id: model.attributes.id }
        };
      }
    }
    */
    
    return model;
  }
  
  return this.new();
};