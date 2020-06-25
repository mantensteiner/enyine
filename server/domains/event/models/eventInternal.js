var BaseModel = require('../../_shared/baseModel'),
    spacePolicies = require('../../_shared/spacePolicies'),
    log = require('../../../utils/logger'),
    typeHelper = require('../../../utils/typeHelper'),
    ValidationError = require('../../../utils/errors').ValidationError,
    Snapshot = require('./snapshot'),
    Subscriber = require('./subscriber'),
    q = require('q'),
    _ = require('underscore');

module.exports = function(modelConfig) {
  // init
  var model = BaseModel.create({
    index: "event",
    type: "event",
    disableEventLog: true, // do not log the event logging itself
    skipAuth: true,
    sortField: "timestamp",
    sortDir: "desc"
  }, modelConfig);
  
  // model.validate
  model.validate = function(eventConfig) {
    /*if(!eventConfig.spaceId) 
      return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });*/
    if(!eventConfig.sourceConfig.type) 
      return q.fcall(function () { throw new ValidationError('Type missing.'); });
    if(!eventConfig.recordId) 
      return q.fcall(function () { throw new ValidationError('RecordId missing.'); });
    else if(!eventConfig.namespace) 
      return q.fcall(function () { throw new ValidationError('Namespace missing.'); });
    
    return q.fcall(function () { return eventConfig; });
  }
    
  // model.write
  model.write = function(eventConfig, skipAuth) {
    var self = this;
    var defer = q.defer();
    var data = {};
    var changedFields = null;
    if(eventConfig.sourceConfig.type) {
      changedFields = {};
      changedFields[eventConfig.sourceConfig.type] = [];
    }
    
    var maxRecordedContentLength = 250;
    
    // operation: each operation on the domain objects implementing the baseModel finally result in a 'create','update','delete'.
    // even on batch-jobs or commands like setting relations in the end the domain model is in the end persisted in one
    // of the three ways. therefore with this operations the whole picture of the record can be constructed.
    
    console.log(eventConfig.namespace);
    
    // CREATE
    if(eventConfig.operation == "create") {
      if(changedFields) {
        _.each(_.keys(eventConfig.sourceData), function(key) {
          var changedField = {};
          
          if(!_.contains(eventConfig.sourceConfig.excludeFieldsFromEventlog, key)) {
            var _val = eventConfig.sourceData[key];
            var dataType = typeHelper.getTypeName(_val);
            
            changedField.name = key;
            var fieldConfig = {
              changedField: changedField, 
              dataType: dataType,
              _val: _val
            };
            setChangedField(fieldConfig);
            changedField = fieldConfig.changedField;
            _val = fieldConfig._val;
            dataType = fieldConfig.dataType;
            
            // do some validation, here: check content length
            if(_.isString(_val) && _val.length > maxRecordedContentLength) {
              _val = 'not recorded (content length ' + _val.length + ')'
            }
    
            data[key] = _val;
          }
          changedFields[eventConfig.sourceConfig.type].push(changedField);        
        });
      }
      
      writeEvent() // write event
      .then(function(result) { // success
        defer.resolve(result); 
      })
      .fail(function(err) { // error
        log.error(err, {eventConfig: eventConfig.sourceData, name: 'event.write.create'});
        defer.reject(err);
      });
      
      // UPDATE
    }  else if(eventConfig.operation == "update") {
      // old/new: just write the current field data without detecting the exact changes, 
      // if needed this can be done by comparing two objects on the client and highlighting changed fields
      // saves data & perf, allows easier reconstruction, timetravel if just the flat object properties are stored     
      
      // on the other hand TRIGGERS on specific field changes must be possible (e.g. eventDate for topic changed) 
      // a data structure with the change data (fields+values) is necessary
      // implementation: get the latest snapshot of the record (fetch all, fast-forward & reconstruct from beginning) 
      // (memento: each change is applied to the latest snapshot for quick reconstruction)
     
      Snapshot({user:self.user, txnId: self.txnId})
      .findOne({recordId: eventConfig.recordId, type: eventConfig.sourceConfig.type}) // find snapshot
      .then(function(snap) { // build event data
        //if(!snap)
        //  throw new Error('Expected a snapshot for the record ' + eventConfig.recordId);
        
        
        // compare incoming record with last snapshot to find changed fields
        if(changedFields && snap) {
          var snapData = snap.data[eventConfig.sourceConfig.type];
          
          _.each(_.keys(eventConfig.sourceData), function(key) {
            var changedField = {};
            
            if(!_.contains(eventConfig.sourceConfig.excludeFieldsFromEventlog, key)) {
              var _val = eventConfig.sourceData[key];
              if (_.isString(_val) && _val.length > maxRecordedContentLength) {
                _val = 'not recorded (content length ' + _val.length + ')'
              }
                  
              if (!snapData || (!snapData[key] && _val)) { // New property
                var dataType = typeHelper.getTypeName(_val);
                changedField.name = key;
                var fieldConfig = {
                  changedField: changedField, 
                  dataType: dataType,
                  _val: _val
                };
                setChangedField(fieldConfig);
                changedField = fieldConfig.changedField;
                _val = fieldConfig._val;
                dataType = fieldConfig.dataType;
                data[key] = _val;
              }
              else { // Updated property
                var _oldVal = snapData[key];
                if (_.isString(_oldVal) && _oldVal.length > maxRecordedContentLength) {
                  _oldVal = 'not recorded (content length ' + _oldVal.length + ')'
                }
  
                if (!_.isEqual(_val, _oldVal)) {
                  var dataType = typeHelper.getTypeName(_val);
                  changedField.name = key;
                  var fieldConfig = {
                    changedField: changedField, 
                    dataType: dataType,
                    _val: _val
                  };
                  setChangedField(fieldConfig);
                  changedField = fieldConfig.changedField;
                  _val = fieldConfig._val;
                  dataType = fieldConfig.dataType;
                  data[key] = _val;
                }
              }
            }
            if(changedField.name)
              changedFields[eventConfig.sourceConfig.type].push(changedField);
          });
        }
        
        return writeEvent(); // write event
      })
      .then(function(result) { // success
        defer.resolve(result); 
      })
      .fail(function(err) { // error
        log.error(err, {eventConfig: eventConfig.sourceData, name: 'event.write.update'});
        return defer.reject(err);
      });
      
      // DELETE
    } else if(eventConfig.operation == "delete") {
      data = {};
      data['id'] = eventConfig.recordId; 
      writeEvent()
      .then(function(result) { // success
        defer.resolve(result); 
      })
      .fail(function(err) { // error
        log.error(err, {eventConfig: eventConfig.sourceData, name: 'event.write.other'});
        defer.reject(err);
      });
      
      // OTHER
    } else {
      writeEvent()
      .then(function(result) { // success
        defer.resolve(result); 
      })
      .fail(function(err) { // error
        log.error(err, {eventConfig: eventConfig.sourceData, name: 'event.write.other'});
        defer.reject(err);
      });
    }
    
    // write event
    function writeEvent() {
      if(!data) data = null;
  
      var pId = eventConfig.spaceId ? eventConfig.spaceId : null;
      if(!pId && eventConfig.sourceConfig.type === 'space' && eventConfig.sourceData) {
        pId = eventConfig.sourceData.id;
      }
  
      var event= {
        namespace: eventConfig.namespace,
        namespaces: eventConfig.namespaces,
        timestamp: new Date(),
        spaceId: pId,
        operation: eventConfig.operation,
        type: eventConfig.sourceConfig.type,
        user: self.user ? { id: self.user.id, username: self.user.username } : null,
        recordId: eventConfig.recordId,
        description: eventConfig.description,
        data: {},
        changedFields: changedFields,
        meta: eventConfig.sourceConfig.metaData ? JSON.stringify(eventConfig.sourceConfig.metaData) : null
      };
      
      
      // set data in nested object for the specific TYPE
      event.data[eventConfig.sourceConfig.type] = data;
      var snap = null;
      model.data = event;
      
      return model.create()
      .then(function(result) {  // Validate snapshot
        return Snapshot({user: self.user, txnId: self.txnId}).validate(eventConfig);
      })
      .then(function(_eventConfig) { // Write snapshot
        return Snapshot({user: self.user, txnId: self.txnId}).writeSnapshot(_eventConfig); // save is overwritten here, pass config
      })
      /*.then(function(savedSnap) { // Fire events for subscribers
        snap = savedSnap;
        // write ok, now find subscribers to the namespace and fire event hooks 
        
        // Writing to internal subscribers is synchronous 
        // Transactions could be implemented, rollback the event if a subscriber fails 
        // (but all successful recipients would have to be rollbacked too...hard)
        // Providing a sychronous request chains for internal use makes the application flow
        // a lot easier, e.g. 
        // 1. a space is create
        // 2. the creator is set as space-admin (update the user domain)
        // 3. the respsonse is sent to the client & all necessary data in different domains is correct
        // synchronization of dependent steps in different domains 
        return Subscriber({user:self.user, txnId: self.txnId}).deliverInternal({
          event: event, 
          snapshot: snap
        });
      })
      .then(function(deliveryResult) { // Get latest snapshot
        
        // deliver to external subscribers, do not wait on response
        //Subscriber({user:self.user}).deliverExternal({
        //  event: event, 
        //  snapshot: snap,
        //  spaceId: event.spaceId
        //});
        
        // Return the latest image of the record (construct from snapshot+changes)
        // to ensure the eventstore is the 'source of truth' and all connected domains
        // have the same data (avoid inconsitencies & detect bugs if the eventstore provides wrong data).
        return Snapshot({user: self.user, txnId: self.txnId}).getById(snap.id);
      })*/
      .then(function(writeSnapResult) { // Write snapshot
        return Snapshot({user: self.user, txnId: self.txnId}).getById(writeSnapResult.id);// save is overwritten here, pass config
      })
      .then(function(currentSnap) {
        return q.fcall(function () {
            return {event:event, snapshot: currentSnap};
        });
      });
    }
    
    return defer.promise;
  }

  function setChangedField(fieldConfig) {
      if(fieldConfig.dataType === 'array') { // on array create another nested object (changedField.name) to avoid type collisions
        fieldConfig.changedField[fieldConfig.dataType] = {};
        fieldConfig.changedField[fieldConfig.dataType][fieldConfig.changedField.name] = fieldConfig._val;
      }
      else if(fieldConfig.dataType === 'string' && isIsoDateString(fieldConfig._val)) { 
        fieldConfig.dataType = "date";
        fieldConfig._val = new Date(fieldConfig._val);
        fieldConfig.changedField[fieldConfig.dataType] = fieldConfig._val;  // date value
      }
      else { 
        fieldConfig.changedField[fieldConfig.dataType] = fieldConfig._val;  // normal value
      }
  }
  
  function isIsoDateString(value) {
    var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;
    
    return (Date.parse(value) && value.match(regexIso8601) !== null) ? true : false;
  } 

  return model;
};