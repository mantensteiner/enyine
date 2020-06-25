var BaseModel = require('../../_shared/baseModel'),
    ValidationError = require('../../../utils/errors').ValidationError,
    log = require('../../../utils/logger'),
    spacePolicies = require('../../_shared/spacePolicies'),
    modelDefinition = require('../config/mapping').note.properties,
    modelShaper = require('../../_shared/modelShaper'),
    q = require('q');

module.exports = function(modelConfig) {
  this.new = function() {
    var self = this;
        
    var model = BaseModel.create({
      index: "note",
      type: "note",
      policy: spacePolicies.spaceMemberPolicy,
      sortField: "modifiedOn",
      sortDir: "desc",
      //excludeFieldsFromEventlog: ['content']
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
          model.getById(modelData.id).then(function(note) {
            if(model.data.private && note.createdBy !== model.user.username) {
              var err = new Error('Only self created notes can be private.');
              err.code = 401;
              return defer.reject(err);
            }
    
            // Implementation only for single user privacy and not multiple user sharing
            // On private note check user privilege
            if(note.private) {
              // Is calling user the granted user?
              var isGrantedUser = _.findWhere(note.users, model.user.id);
              if(!isGrantedUser) {
                var err = new Error('User has no privilege.');
                err.code = 401;
                return defer.reject(err);
              }
            }
            return saveNote();
          })
          .fail(function(err){
            return defer.reject(err);
          });
        }
        else {
          return createNote();
        }

        function createNote() {
          if(modelData.private) {
            modelData.users = [model.user.id];
          }
          else {
            modelData.users = [];
          }
          model.data = modelData;
          return model.create();
        }
      
        function saveNote() {
          if(modelData.private) {
            modelData.users = [model.user.id];
          }
          else {
            modelData.users = [];
          }
          model.data = modelData;
          return model.save();
        }
      })
      .then(function(result) {
        return defer.resolve(result);
      })
      .fail(function(err) {
        log.error(err, {name: 'note.validateSave', modelData: modelData});
        return defer.reject(err);
      });
      
      return defer.promise;
    }
    
    return model;
  }
  
  return this.new();
};