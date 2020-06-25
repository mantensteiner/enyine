var BaseModel = require('../../_shared/baseModel'),
    ValidationError = require('../../../utils/errors').ValidationError,
    log = require('../../../utils/logger'),
    spacePolicies = require('../../_shared/spacePolicies'),
    modelDefinition = require('../config/mapping').quantity.properties,
    modelShaper = require('../../_shared/modelShaper'),
    q = require('q');

module.exports = function(modelConfig) {
  this.new = function() {
    var self = this;
        
    var model = BaseModel.create({
      index: "quantity",
      type: "quantity",
      sortField: "modifiedOn",
      sortDir: "desc",
      skipAuth: true,
      disableEventLog: true // do not write this maintenance task to event store
    }, modelConfig);
  
    // model.validate
    model.validate = function(modelData) {
      if(!modelData.id) {
        return q.fcall(function () { throw new ValidationError('id missing.'); });
      }
      if(!modelData.dataTypeKey) {
        return q.fcall(function () { throw new ValidationError('dataTypeKey missing.'); });
      }
      if(!modelData.name) {
        return q.fcall(function () { throw new ValidationError('dataTypeKey missing.'); });
      }
      if(!modelData.units || modelData.units.length == 0) {
        return q.fcall(function () { throw new ValidationError('dataTypeKey missing.'); });
      }
      return q.fcall(function () { return modelShaper({definition: modelDefinition, data: modelData}); });
    }
   
    // model.validateSave
    model.validateSave = function(modelData) {
      var defer = q.defer();

      model.validate(modelData)
      .then(function(data) {
        model.data = data;
        return model.findOne("id:" + data.id);
      })
      .then(function(existing) {
        if(!existing) {
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
        log.error(err, {name: 'quantity.validateSave', modelData: modelData});
        return defer.reject(err);
      });
      
      return defer.promise;
    }

    model.import = function(modelArray) {
      var promises = [];
      modelArray.forEach(function (el) {
        var m = self.new();
        m.data = el;
        promises.push(m.validateSave(el));
      });
      return q.all(promises);
    }
    
    return model;
  }
  
  return this.new();
};