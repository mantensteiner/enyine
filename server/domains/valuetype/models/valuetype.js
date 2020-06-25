var BaseModel = require('../../_shared/baseModel'),
    apiRegistry = require('../../_shared/apiRegistry'),
    ValidationError = require('../../../utils/errors').ValidationError,
    log = require('../../../utils/logger'),
    spacePolicies = require('../../_shared/spacePolicies'),
    modelDefinition = require('../config/mapping').valuetype.properties,
    modelShaper = require('../../_shared/modelShaper'),
    q = require('q'),
    _ = require('underscore');

module.exports = function(modelConfig) {
  this.new = function() {
    var self = this;
        
    var model = BaseModel.create({
      index: "valuetype",
      type: "valuetype",
      policy: spacePolicies.spaceMemberPolicy,
      sortField: "modifiedOn",
      sortDir: "desc"
    }, modelConfig);
  
    // model.validate
    model.validate = function(modelData) {
      if(!modelData.spaceId && !modelData.userId) 
        return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });
        
      return q.fcall(function () { return modelShaper({definition: modelDefinition, data: modelData}); });
    }
   
    // model.validateSave
    model.validateSave = function(modelData) {
      var defer = q.defer();
      
      model.validate(modelData)
      .then(function(data) {
        model.data = data;
        if(!model.data.id) {
          return model.create();
        }
        else {
          return model.save();
        }
      })
      .then(function(result) {
        return defer.resolve(result);
      })
      .fail(function(err) {
        log.error(err, {name: 'valueType.validateSave', modelData: modelData});
        return defer.reject(err);
      });
      
      return defer.promise;
    }

    // model.validateDelete
    model.validateDelete = function(id) {
      var defer = q.defer();
      
      // todo: check if valueType is 
      // - NOT system
      // - NOT used by an item type 
      //return q.fcall(function () { throw new ValidationError('not implemented.'); });

      // check id valuetype is used in an itemtype
      var itemtypeDomain = apiRegistry.getDomain('itemtype', model.user);
      itemtypeDomain.search('valueTypes.sourceId:'+id)
      .then(function(result) {
        if(model.unwrapResultRecords(result).length == 0) {
          model.delete(id)
          .then(function(result) {
            return defer.resolve(result);
          })
          .fail(function(err) {
            log.error(err, {name: 'valueType.validateDelete', modelData: id});
            return defer.reject(err);
          });
        }
        else {
          var msg = `valuetype with id ${id} is currently used in itemtypes`;
          log.error(msg, {name: 'value.validateDelete', modelData: id});
          return defer.reject(msg);          
        }
      })
      .fail(function(err) {
        log.error(err, {name: 'value.validateDelete.itemtypeDomain.search', modelData: id});
        return defer.reject(err);
      });
      
      return defer.promise;
    }

    return model;
  }
  
  return this.new();
};