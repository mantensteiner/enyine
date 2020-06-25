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
      type: "target",
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
      
      model.validate(modelData)
      .then(function(data) {
        model.data = data;
        return model.save();
      })
      .then(function(result) {
        return defer.resolve(result);
      })
      .fail(function(err) {
        log.error(err, {name: 'target.validateSave', modelData: modelData});
        return defer.reject(err);
      });
      
      return defer.promise;
    }
    
    return model;
  }
  
  return this.new();
};