var BaseModel = require('../../_shared/baseModel'),
    ValidationError = require('../../../utils/errors').ValidationError,
    log = require('../../../utils/logger'),
    spacePolicies = require('../../_shared/spacePolicies'),
    modelDefinition = require('../config/mapping').message.properties,
    modelShaper = require('../../_shared/modelShaper'),
    q = require('q');

module.exports = function(modelConfig) {
  this.new = function() {
    var self = this;
        
    var model = BaseModel.create({
      index: "message",
      type: "message",
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

        if(modelData.id) {
          return model.save();
        }
        else {
          return model.create();
        }
      })
      .then(function(result) {
        return defer.resolve(result);
      })
      .fail(function(err) {
        log.error(err, {name: 'message.validateSave', modelData: modelData});
        return defer.reject(err);
      });
      
      return defer.promise;
    }
    
    return model;
  }
  
  return this.new();
};