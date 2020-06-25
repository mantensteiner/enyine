var esRepo = require('../../utils/esRepo'),
    idGen = require('../../utils/idGen'),
    log = require('../../utils/logger'),
    typeHelper = require('../../utils/typeHelper'),
    config = require('../../config')(),
    ValidationError = require('../../utils/errors').ValidationError,
    ElasticsearchRepoError = require('../../utils/errors').ElasticsearchRepoError,
    AuthorizationError = require('../../utils/errors').AuthorizationError,
    q = require('q'),
    _ = require('underscore'),
    eventLogger = require('./eventLogger'),
    subscriberCallerInternal = require('./subscriberCallerInternal');
    
var BaseModel = function(modelConfig, passedConfig) {
  var self = this;
  
  self.init = function() {
    // Merge config object passed into the child object
    if(passedConfig) {
      _.extend(modelConfig, passedConfig);
    }
      
    // Store passed config 
    self.inputConfig = modelConfig;
    
    // Use a default repository (ES) or inject a custom repository (eg Mock)
    if(!modelConfig.repository) {
      self.repo = esRepo({newInstance: false}); // default: use single instance of Elasticsearch
    }
    else {
      self.repo = modelConfig.repository; // custom repository
    }
      
    // inject a custom logger
    if(modelConfig.logger) {
      log = modelConfig.logger;
    }
      
    // instead of passing the systemUser for anonymous calls, provide this flag
    if(modelConfig.unauthenticatedOperation === true) {
      modelConfig.user = config.auth.systemUser;
    }
  
    // validation
    if(!modelConfig.index) {
      throw new ValidationError('Missing model index');
    }
    if(!modelConfig.type) {
      throw new ValidationError('Missing model type');
    }
    if(!modelConfig.user) {
      throw new Error("Missing user");
    }
    
    // data-field
    self.data = { };
    if(modelConfig.id) { // id must not be null,false,undefined 
      self.data.id = modelConfig.id;
    } 
    if(modelConfig.data) {
      _.extend(self.data, modelConfig.data);
    }
      
    // logEventOverride - allow overwrite of eventstore reporting (eg. for mocking tests)
    if(modelConfig.logEventOverride && 
      typeHelper.getTypeName(modelConfig.logEventOverride) === 'function') {
      self.logEvent = modelConfig.logEventOverride; 
    }
    
    //  domain-config
    self.index = config.getIndex(modelConfig.index);
    self.type = modelConfig.type;
    
    // which fields to write
    self.fields = (modelConfig.fields && modelConfig.fields.length > 0) ? modelConfig.fields : null;
    
    // search config
    self.skip = modelConfig.skip || 0;
    self.take = modelConfig.take || 50;
    self.sortField = modelConfig.sortField || null;
    self.sortDir = modelConfig.sortDir || null;
    self.resultFields = modelConfig.resultFields || null;
    
    // forceFullWrite: if set no partial updates of the record will be made, 
    // but the record will be overwritten with the current data 
    self.forceFullWrite = modelConfig.forceFullWrite || false;
    
    // skipChangeData: if set true the default createdBy/On, modifiedBy/On fields will not be 
    // set in the before & after-handlers of the baseModel
    self.skipChangeData = modelConfig.skipChangeData || false;
    
    // transactionData: info about the request, eg. containing information 
    // about a multi-phase operation (eg. for better log analytics), auth, caller-system...
    self.txnId = modelConfig.txnId || null;
    self.transactionData = modelConfig.transactionData || null;
    
    // do not write to the event domain (eg authentication)
    // all business logic domains should write all modifying operation to the eventLog
    self.disableEventLog = modelConfig.disableEventLog || false;
    // namespaces: provide additional namespaces to classify the event besides the default operation
    // providing additional namespaces is encouraged, because this way the intent on the business logic is not lost
    self.namespaces = modelConfig.namespaces || [];
    // define explicit fields not to write in the event-domain (this setting is evaluated in the event domain)
    self.excludeFieldsFromEventlog = modelConfig.excludeFieldsFromEventlog || [];
    // exclude transaction id from change detection
    self.excludeFieldsFromEventlog.push('txnId');
    
    // provide additional data regarding the event, which could be interesting to subscribers
    // this field gets serialized for persistence
    self.eventMetaData = modelConfig.eventMetaData || null;
    
    // setUser
    self.setUser = function(usr) {
      self.user = {
        id: usr.id || usr.userId,
        username: usr.username,
        email: usr.email
      };
      if(self.user.username === config.auth.systemUser.username)
        self.skipAuth = true;
    }
    self.setUser(modelConfig.user);
      
    // if user is SYSTEM - set skip auth
    if(self.user === config.auth.systemUser.username) {
      self.skipAuth = true;
    }
    
    self.auth = modelConfig.auth ? modelConfig.auth : null;
    self.skipAuth = modelConfig.skipAuth === true ? true : false;
    self.policy = {};
    
    // Set authorization policies on all methods
    self.setPolicy = function(policy, methods) {
      // set all methods 
      if(!methods || methods.length === 0) {
        self.policy["create"] = policy(this);
        self.policy["save"] = policy(this);
        self.policy["delete"] = policy(this);
        self.policy["get"] = policy(this);
        self.policy["findOne"] = policy(this);
        self.policy["search"] = policy(this);
      } else { // set on individual methods
        _.each(methods, function(m) {
          self.policy[m] = policy(this);
        });
      }
    }
    
    if(!modelConfig.policy) {
      // default policy, allow all operations
      self.policy =  {
        create: function() {
          return q.fcall(function () { return { ok: true }; });
        },
        save: function() {
          return q.fcall(function () { return { ok: true }; });
        },
        delete: function() {
          return q.fcall(function () { return { ok: true }; });
        },
        findOne: function() {
          return q.fcall(function () { return { ok: true }; });
        },
        get: function() {
          return q.fcall(function () { return { ok: true }; });
        },
        search: function() {
          return q.fcall(function () { return { ok: true }; });
        }
      };
    } else {
      self.setPolicy(modelConfig.policy);
    }
    
    self.unwrapRecord = function(record) {
      return self.repo.unwrapRecord(record);
    }
    
    self.unwrapResultRecords = function(results) {
      return self.repo.unwrapResultRecords(results);
    }
    
    self.extendObject = function (source) {
      var self = this;
      for (var k in source) {
        if (source.hasOwnProperty(k)) {
          self[k] = source[k];
        }
      }
    }
  }
  
  self.init();
};

// logEvent
BaseModel.prototype.logEvent = function(operation, recordId, description) {
  var self = this;
  var defer = q.defer();
  
  if(self.disableEventLog) {
    return q.fcall(function () { return self.data; });
  }

  var eventConfig = getEventConfig(self, {
    operation: operation,
    recordId: recordId,
    description: description
  });
  
  eventLogger(eventConfig, self.user)
  .then(function(record) { // success
    return defer.resolve(record); 
  })
  .fail(function(err) { // error
    log.error(err, {eventConfig:eventConfig, name:'baseModel.logEvent.eventLogger'});
    return defer.reject(err);
  });
  
  return defer.promise;
}

// call internal subscribers
BaseModel.prototype.callInternalSubscribers = function(subscriberConfig) {
  var self = this;
  var defer = q.defer();
  
  if(self.disableEventLog) {
    return q.fcall(function () { return self.data; });
  }
  
  var eventConfig = getEventConfig(self, subscriberConfig);
  
  subscriberCallerInternal(eventConfig, self.user)
  .then(function(deliveryResult) { // success
    return defer.resolve(deliveryResult);
  })
  .fail(function(err) { // error
    log.error(err, {eventConfig:eventConfig, name:'baseModel.callInternalSubscribers.subscriberCallerInternal'});
    return defer.reject(err);
  });
  
  return defer.promise;
}

// build event config object
function getEventConfig(self, subscriberConfig) {
  return {
    txnId: self.txnId,
    operation: subscriberConfig.operation,
    recordId: subscriberConfig.recordId,
    spaceId: self.type === 'space' ? self.data.id : self.data.spaceId,
    description: subscriberConfig.description,
    sourceData: self.data,
    namespace: self.index + '.' + self.type + '.' + subscriberConfig.operation,
    namespaces: self.namespaces,
    domain: self.index,
    type: self.type,
    sourceConfig: {
      type: self.type,
      excludeFieldsFromEventlog: self.excludeFieldsFromEventlog,
      metaData: self.eventMetaData
    },
    changedFields: subscriberConfig.changedFields || []
  };
}

// pre & post-methods, create & save with default change log
// can be overwritten by the model if needed (when fields are not provided)
// txnId (normally injected on model init) set per default on all write operations
BaseModel.prototype.beforeCreate = function(record) { 
  var self = this;
  return q.fcall(function () { 
    if(!record) {
      record = self.data;
    }
    if(!self.skipChangeData) {
      record.createdOn = record.createdOn ? record.createdOn : new Date();
      record.modifiedOn = record.modifiedOn ? record.modifiedOn : new Date();
      if(self.user) {
        record.createdBy = record.createdBy ? record.createdBy : self.user.username;
        record.modifiedBy = record.modifiedBy ? record.modifiedBy : self.user.username;
      }
    }
    
    // transaction id
    record.txnId = self.txnId || null;    
    return record; 
  }); 
}
BaseModel.prototype.beforeSave = function(record) { 
  var self = this;
  return q.fcall(function () { 
    if(!record) {
      record = self.data;
    }
    
    if(!self.skipChangeData) {
      if(!record.id || self.forceFullWrite) { // create or new overwrite
        record.createdOn = record.createdOn ? record.createdOn : new Date();
        if(self.user) {
          record.createdBy = record.createdBy ? record.createdBy : self.user.username;
        }
      }
      record.modifiedOn = record.modifiedOn ? record.modifiedOn : new Date();
      
      if(self.user) {
        record.modifiedBy = record.modifiedBy ? record.modifiedBy : self.user.username;
      }
    }
    
    // transaction id
    record.txnId = self.txnId || null;         
    return record; 
  }); 
}
BaseModel.prototype.beforeDelete = function(record) { 
  var self = this;
  return q.fcall(function () { 
    if(!record) {
      record = self.data;
    }
    
    // transaction id
    record.txnId = self.txnId || null; 
    return record; 
  }); 
}

BaseModel.prototype.afterCreate = function(obj) { return q.fcall(function () { return obj; }); }
BaseModel.prototype.afterSave = function(obj) { return q.fcall(function () { return obj; }); }
BaseModel.prototype.afterDelete = function(obj) { return q.fcall(function () { return obj; }); }

// create
BaseModel.prototype.create = function(opConfig) {
  var self = this;
  var defer = q.defer();
  var eventResult = null;
  var snapshot = null;
  
  // validate
  if(!self.data || _.keys(self.data).length === 0) {
    return q.fcall(function () { throw new ValidationError('create.data'); });
  }
  
  // Reduce to configured fields
  if(self.fields) {
    self.data = _.pick(self.data, 'id', self.fields);
  }
  
  self.beforeCreate() // before create
  .then(function() { 
    return self.policy["create"]({action:'create'}); // get policy
   })
  .then(function(policyResult) { // eventstore
    if(policyResult.ok || self.skipAuth) {
      if(!self.data.id) { self.data.id = idGen(); };
      return self.logEvent('create', self.data.id, null); 
    }
    throw new AuthorizationError(self.type + '.create');
  })
  .then(function(_eventResult) { // domain repo
    eventResult = _eventResult;
    //eventResult.snapshot.data[self.type]
    return self.repo.create(_.extend({
      index:self.index, 
      type: self.type, 
      record: self.data}, opConfig)); 
  })
  .then(function(result) {     
    return self.afterCreate(result); // after create
  })
  .then(function(result) { // fire subscribers    
    snapshot = result;
    // Option to call subscribers async?    
    return self.callInternalSubscribers({
      operation: 'create', 
      recordId: self.data.id, 
      description: null, 
      changedFields: (eventResult && eventResult.event) ? eventResult.event.changedFields : []
    });  
  })
  .then(function(deliveryResult) {
    return defer.resolve(snapshot); // success
  })
  .fail(function(err) {
    if(!(err instanceof ElasticsearchRepoError)) {  // already logged 
      log.error(err, {name:'baseModel.create', data: self.data});
    }
    
    return defer.reject(err); // error
  });
         
  return defer.promise;
}

// save
BaseModel.prototype.save = function(opConfig) {
  var self = this;
  var defer = q.defer();
  var eventResult = null;
  var snapshot = null;

  // validate
  if(!self.data  || _.keys(self.data).length === 0) {
    return q.fcall(function () { throw new ValidationError('save.data'); });
  }

  // Reduce to configured fields
  if(self.fields) {
    self.data = _.pick(self.data, 'id', self.fields);
  }
  
  self.beforeSave() // before save
  .then(function() { 
    return self.policy["save"]({action:'save'}); // auth policy
  })
  .then(function(policyResult) { // eventstore
    if(policyResult.ok || self.skipAuth) {
      return self.logEvent('update', self.data.id, null); 
    }
    throw new AuthorizationError(self.type + '.save');
  })
  .then(function(_eventResult) { // domain repo
    eventResult = _eventResult;
    return self.repo.save(_.extend({
      index:self.index,
      type: self.type, 
      record: self.data,  
      forceIndex: self.forceFullWrite}, opConfig));
  })
  .then(function(result) { 
    return self.afterSave(result); // after save
  })
  .then(function(result) { // fire subscribers    
    snapshot = result;
    // Option to call subscribers async?    
    return self.callInternalSubscribers({
      operation: 'update', 
      recordId: self.data.id, 
      description: null, 
      changedFields: (eventResult && eventResult.event) ? eventResult.event.changedFields : []
    });
  })
  .then(function(deliveryResult) {
    return defer.resolve(snapshot); // success
  })
  .fail(function(err) {
    if(!(err instanceof ElasticsearchRepoError)) { // already logged 
      log.error(err, {name:'baseModel.save', data: self.data});
    } 
    
    return defer.reject(err); // error
  });

  return defer.promise;  
}

// delete
BaseModel.prototype.delete = function(id, opConfig) {
  var self = this;
  var defer = q.defer();
  var eventResult = null;
  
  self.data.id = id;
  
  self.beforeDelete() // before delete
  .then(function() { 
    return self.policy["delete"]({action:'delete'}); // delete policy
   })
  .then(function(policyResult) { // eventstore
    if(policyResult.ok || self.skipAuth) {
      return self.logEvent('delete', self.data.id, null); 
    }
    throw new AuthorizationError(self.type + '.delete');
  })
  .then(function(_eventResult) {  // domain repo
    eventResult = _eventResult;
    return self.repo.delete(_.extend({
      index: self.index, 
      type: self.type, 
      id: self.data.id
    }, opConfig));  
  })
  .then(function(result) { 
    return self.afterDelete(result); // after delete
  })
  .then(function(result) { // fire subscribers    
    // Option to call subscribers async?    
    return self.callInternalSubscribers({
      operation: 'delete', 
      recordId: self.data.id, 
      description: null, 
      changedFields: []
    });  
  })  
  .then(function(deliveryResult) {
    return defer.resolve(self.data.id); // success
  })
  .fail(function(err) {
    if(!(err instanceof ElasticsearchRepoError)) { // already logged 
      log.error(err, {name:'baseModel.delete'});
    } 
    
    return defer.reject(err); // error
  });
  
  return defer.promise;
}

// deleteByQuery
// this operation is not meant to be used by the business logic (does not support auth+eventLog)
// but only for clean ups, eg. deleting test records
BaseModel.prototype.deleteByQuery = function(query, opConfig) {
  var self = this;
  var defer = q.defer();
  
  if(!self.skipAuth) {
    throw new AuthorizationError("Operation deleteByQuery does not support user authorization and the event store.");
  }
  
  self.data.query = query;
  
  self.repo.deleteBulk(_.extend({
      index: self.index, 
      type: self.type, 
      query: query
    }, opConfig))
  .then(function(_query) {
    return defer.resolve(_query); // success
  })
  .fail(function(err) {
    if(!(err instanceof ElasticsearchRepoError)) { // already logged 
      log.error(err, {name:'baseModel.deleteByQuery'});
    } 
    
    return defer.reject(err); // error
  });
  
  return defer.promise;
}

// getById
BaseModel.prototype.getById = function(id, opConfig) {
  var self = this;
  var defer = q.defer();

  self.policy["get"]({query: id, action: 'query'}) // check policy
  .then(function(policyResult) {
    if(policyResult.ok || self.skipAuth) {
      return self.repo.getById(_.extend({
        index: self.index, 
        type: self.type, 
        id: id, 
        auth: self.auth
      }, opConfig));
    }
    throw new AuthorizationError(self.type + '.getById'); // not authorized
  })
  .then(function(record) {
    return defer.resolve(record); // success
  })
  .fail(function(err) {
    if(!(err instanceof ElasticsearchRepoError)) { // already logged 
      log.error(err, {name:'baseModel.getById', id: id});
    }
    
    return defer.reject(err); // error
  });

  return defer.promise;
}

// findOne, query can be a string (eg 'name:birdo') or a object {name:'birdo'}
BaseModel.prototype.findOne = function(query, opConfig) {
  var self = this;
  var defer = q.defer();

  self.policy["findOne"]({query: query, action: 'query'})
  .then(function(policyResult) { 
    if(policyResult.ok || self.skipAuth) {
      return self.repo.findOne(_.extend({
        index: self.index, 
        type: self.type, 
        query: query, 
        auth: self.auth}, opConfig));
    }
    throw new AuthorizationError(self.type + '.findOne'); // not authorized
  })
  .then(function(record) {
    return defer.resolve(record); // success
  })
  .fail(function(err) {
    if(!(err instanceof ElasticsearchRepoError)) { // already logged 
      log.error(err, {name:'baseModel.findOne', query: query});
    } 
    return defer.reject(err); // error
  });

  return defer.promise;
}

// count
BaseModel.prototype.count = function(query, opConfig) {
  var self = this;
  var defer = q.defer();
  
  self.policy["search"]({query: query, action: 'query'}) // use search policy for count
  .then(function(policyResult) {
    if(policyResult.ok || self.skipAuth) {
      return self.repo.count(_.extend({
        index: self.index, 
        type: self.type, 
        query: query ? query : '*'
      }, opConfig));
    }
    throw new AuthorizationError(self.type + '.count'); // not authorized
  })
  .then(function(result) {
    return defer.resolve(result); // success
  })
  .fail(function(err) {
    if(!(err instanceof ElasticsearchRepoError)) { // already logged 
      log.error(err, {name:'baseModel.count', query: query});
    } 
    return defer.reject(err); // error
  });
  
  return defer.promise;
}

// get
BaseModel.prototype.get = function(opConfig) {
  var self = this;
  var defer = q.defer();
  
  self.policy["get"]({action: 'query'})
  .then(function(policyResult) {
    if(policyResult.ok || self.skipAuth) {
      return self.repo.get(_.extend({
        index: self.index, 
        type: self.type, 
        skip: self.skip, 
        take: self.take, 
        sortField: self.sortField, 
        sortDir: self.sortDir, 
        auth: self.auth
      }, opConfig));
    }
    throw new AuthorizationError(self.type + '.get'); // not authorized
  })
  .then(function(records) {
    return defer.resolve(records); // success
  })
  .fail(function(err) {
    if(!(err instanceof ElasticsearchRepoError)) { // already logged 
      log.error(err, {name:'baseModel.get'});
    }
    return defer.reject(err); // error
  });
  
  return defer.promise;
}
  
// search
BaseModel.prototype.search = function(query, aggs, opConfig) {
  var self = this;
  var defer = q.defer();
  
  self.policy["search"]({query: query, action: 'query'})
  .then(function(policyResult) {
    if(policyResult.ok || self.skipAuth) {
      return self.repo.search(_.extend({
        index: self.index, 
        type: self.type, 
        query: query, 
        aggs: aggs, 
        skip: self.skip, 
        take: self.take, 
        sortField: self.sortField, 
        sortDir: self.sortDir, 
        fields: self.fields, 
        auth: self.auth
      }, opConfig));
    }
    throw new AuthorizationError(self.type + '.search'); // not authorized    
  })
  .then(function(records) {
    return defer.resolve(records); // success
  })
  .fail(function(err) {
    if(!(err instanceof ElasticsearchRepoError)) {  // already logged 
      log.error(err, {name:'baseModel.search'});
    }
    return defer.reject(err); // error
  });
  
  return defer.promise;
}

// autoComplete
BaseModel.prototype.autoComplete = function(text, field, opConfig) {
  var self = this;
  var defer = q.defer();  
  
  self.policy["search"]({action: 'query'}) // use search policy for autocomplete
  .then(function(policyResult) {
    if(policyResult.ok || self.skipAuth) {
      return self.repo.autoComplete(_.extend({ // autocomplete
        index: self.index, 
        type: self.type, 
        text: text, 
        field: field
      }, opConfig));
    }
    throw new AuthorizationError(self.type + '.search'); // not authorized    
  })
  .then(function(result) {
    return defer.resolve(result); // success
  })
  .fail(function(err) {
    if(!(err instanceof ElasticsearchRepoError)) { // already logged 
      log.error(err, {name:'baseModel.search'});
    } 
    return defer.reject(err); // error
  });
  
  return defer.promise;
}

module.exports = {
  create:  function(config, externalConfig) {
    return new BaseModel(config, externalConfig);
  }
}