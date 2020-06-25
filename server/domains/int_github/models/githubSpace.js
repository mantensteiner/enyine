var BaseModel = require('../../_shared/baseModel'),
    log = require('../../../utils/logger'),
    q = require('q'),
    ValidationError = require('../../../utils/errors').ValidationError,
    spacePolicies = require('../../_shared/spacePolicies'),
    modelDefinition = require('../config/mapping').int_github.properties,
    modelShaper = require('../../_shared/modelShaper');

module.exports = function(modelConfig) {
  var model = BaseModel.create({
    index: "int_github",
    type: "repository",
    policy: spacePolicies.spaceMemberPolicy
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
      return model.save();
    })
    .then(function(result) {
      return defer.resolve(result);
    })
    .fail(function(err) {
      log.error(err, {name: 'githubSpace.validateSave', modelData: modelData});
      return defer.reject(err);
    });
    
    return defer.promise;
  }

  return model;
};