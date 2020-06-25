var BaseModel = require('../../_shared/baseModel'),
    log = require('../../../utils/logger'),
    ValidationError = require('../../../utils/errors').ValidationError,
    q = require('q');

module.exports = function(modelConfig) {
  this.new = function() {
    var model = BaseModel.create({
      index: "event",
      type: "snapshot",
      disableEventLog: true, // do not log the event logging itself
      // policy: internal model, no security policies
    }, modelConfig);
    
    model.validate = function(snapshotConfig) {
      /*if(!snapshotConfig.spaceId) 
        return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });*/
      if(!snapshotConfig.sourceConfig.type) 
        return q.fcall(function () { throw new ValidationError('Type missing.'); });
      else if(!snapshotConfig.recordId) 
        return q.fcall(function () { throw new ValidationError('RecordId missing.'); });    
      else if(!snapshotConfig.sourceData) 
        return q.fcall(function () { throw new ValidationError('SourceData missing.'); });
      
      return q.fcall(function () { return snapshotConfig; });
    } 
    
    
    // model.save
    model.writeSnapshot = function(eventConfig) {
      var self = this;
      var defer = q.defer();
      
      model.findOne({recordId: eventConfig.recordId, type: eventConfig.sourceConfig.type}) // find snapshot
      .then(function(snapshot) {
        if(!snapshot) {
          snapshot = {
            spaceId: eventConfig.spaceId,
            timestamp: new Date(),
            recordId: eventConfig.recordId,
            type: eventConfig.sourceConfig.type,
            description: eventConfig.description ? eventConfig.description : null,
            data: {}
          };
          snapshot.data[eventConfig.sourceConfig.type] = eventConfig.sourceData;
          model.data = snapshot;
          return self.create(); // create 
        }
        else {
          snapshot.data[eventConfig.sourceConfig.type] = eventConfig.sourceData;
          model.data = snapshot;
          return model.save(); // update
        }
      })
      .then(function(result) { // success
        return defer.resolve(result);
      })
      .fail(function(err) { // error
        log.error(err, {eventConfig: eventConfig, name: 'snapshot.save'});
        defer.reject(err);
      });
      
      return defer.promise;
    }
    
    return model;
  }
  
  return this.new();
};