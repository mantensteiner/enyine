var BaseModel = require('../../_shared/baseModel'),
    interServiceAuth = require('../../_shared/auth/interServiceAuth'),
    transactionHeader = require('../../_shared/transactionHeader'),
    dispatcher = require('../distribution/dispatcher'),
    Delivery = require('./delivery'),
    log = require('../../../utils/logger'),
    typeHelper = require('../../../utils/typeHelper'),
    config = require('../../../config')(),
    ValidationError = require('../../../utils/errors').ValidationError,
    _ = require('underscore'),
    q = require('q');

var Subscriber = function(subscriberConfig) {
  
  this.new = function() {
    var self = this;
    var model = BaseModel.create({
      index: "event",
      type: "subscriber",
      disableEventLog: true, // do not log the event logging itself
      // policy: internal model, no security policies
    }, subscriberConfig);
    
    model.validateSubscriber = function(sub) {
    if(!sub.namespace) 
      return q.fcall(function () { throw new ValidationError('Namespace missing.'); });
    if(!sub.targetUrl) 
      return q.fcall(function () { throw new ValidationError('TargetUrl missing.'); });
    if(!sub.targetUrl) 
      return q.fcall(function () { throw new ValidationError('SubscriberKey missing.'); });
    return q.fcall(function () { return sub; });
  }
      
    model.validateSubscriptions = function(subscriptionsConfig) {
      if(!subscriptionsConfig.subscriberKey) 
        return q.fcall(function () { throw new Error('Expected a subscriberKey') });
      if(!subscriptionsConfig.events || !subscriptionsConfig.events.length) 
        return q.fcall(function () { throw new Error('Expected an array of subscriptions') });
      return q.fcall(function () { return subscriptionsConfig; });
    }
      
    // deliver to all system-interal domains
    model.deliverInternal = function(deliverConfig) {
      var defer = q.defer();
      
      if(!deliverConfig.event)    
        return q.fcall(function () { throw new ValidationError('deliverConfig.event missing.'); });
      if(!deliverConfig.snapshot)    
        return q.fcall(function () { throw new ValidationError('deliverConfig.snapshot missing.'); });
        
      // find subscribers for the event by namespaces
      var namespacesQuery = 'namespace:' + deliverConfig.event.namespace;
      if(deliverConfig.event.namespaces) {
        _.each(deliverConfig.event.namespaces, function(ns) {
          namespacesQuery += ' OR namespace:' + ns;
        });
      }
      
      model.search(namespacesQuery)
      .then(function(subscribers) {
        subscribers = model.unwrapResultRecords(subscribers);
        
        if(subscribers.length === 0) {
          return defer.resolve([]); // do nothing (no subscribers)
        }
      
        var ctr = subscribers.length;
        var deliveries = [];
        _.each(subscribers, function(sub) {
          if(sub.active) {
            var fireSubscription = true;
            
            if(sub.fieldChanges && sub.fieldChanges.length > 0) {
              if(!sub.type) {
                return defer.reject(new ValidationError('field "type" must be set in subscription config to use "fieldChanges"'));
              }
              var listensToField = false;
              // check if subscriber only listens to specific changed fields
              if(deliverConfig.event.changedFields) {
                _.each(deliverConfig.event.changedFields[sub.type], function(field) {
                  if(_.contains(sub.fieldChanges, field.name)) {
                    listensToField = true;
                  }
                });
              }
              
              // fieldChanges provided, but no matching changes => do not fire subscription
              if(!listensToField) {
                fireSubscription = false;
              }
            }
            if(fireSubscription === false) {
              return defer.resolve([]);
            }
            else {
              // Shape response payload (only snapshot-data) with sourceFormatter if defined
              var deliveryPayload = deliverConfig;
              if(sub.sourceFormatter && sub.subscriptionType === 'internal') {
                var formatter = eval(sub.sourceFormatter); // trusted source necessary (only for internal events)
                deliveryPayload.snapshot = formatter(deliverConfig);
              }
              
              interServiceAuth.setHeaderToken({ // build headers for inter-service authentication
                event: deliverConfig.event.namespace,
                user: model.user
              })
              .then(function(authHeaders) {
                if(model.txnId) // set transaction header
                  transactionHeader.set(authHeaders, model.txnId);
              
                console.log(`Dispatching to subscriber ${sub.targetUrl}`);
                
                return dispatcher.request({ // request to subscriber
                  targetUrl: sub.targetUrl, 
                  targetMethod: sub.targetMethod,
                  payload: deliveryPayload,
                  headers: authHeaders
                });
              })
              .then(function(response) { // log delivery
                return logDelivery(200, response);
              })
              .then(function(log) { // success
                deliveries.push(log);
                if(ctr === 0) // all subscribers delivered
                  return defer.resolve(deliveries);
              })
              .fail(function(err) { // error
                logDelivery(sub.id, err.code ? err.code : 500, null, err)
                .then(function(log) {
                  deliveries.push(log);
                  if(ctr === 0) {
                    // all subscribers delivered, but at least some failed
                    // for internal subscriptions all deliveries must succeed for avoiding inconsistencies
                    // (although these can happen for the succeeded operations)
                    return defer.reject(deliveries);
                  }
                })
                .fail(function(err) {
                  defer.reject(err);
                })
              });
            }
          }
        });
        
        function logDelivery(subId, responseCode, response, err) {
          var code = typeHelper.getTypeName(responseCode*1) == 'number' ? responseCode * 1 : -1;
          
          var deferedLog = q.defer();
          // Log deliveries 
          var delivery = Delivery({
            user:model.user, 
            txnId: self.txnId,
            data: {
              eventId: deliverConfig.event.id,
              subscriberId: subId,
              timestamp: new Date(),
              httpResponseCode: code,
              message: err ? err.message : null,
              response: response ? {headers: response.headers, body: response.body } : null
            }
          });
          delivery.create()
          .then(function(log) {
            ctr--;   
            deferedLog.resolve(log);
          })
          .fail(function(err) {
            ctr--;   
            deferedLog.reject(err);
          });
          return deferedLog.promise;
        }
      })
      .fail(function(err) {
        log.error(err, {event: event, name: 'subscriber.deliverInternal'});
        defer.reject(err);
      });
      return defer.promise;
    }
    
    // ToDo: Deliver to all externally registered domains per space
    // Be more restrictive here, eg. do not allow sourceFormatters
    // Requests may fail more often on the recipient side
    model.deliverExternal = function(deliverConfig) {
      if(!deliverConfig.spaceId)    
        return q.fcall(function () { throw new ValidationError('deliverConfig.spaceId missing.'); });
      if(!deliverConfig.event)    
        return q.fcall(function () { throw new ValidationError('deliverConfig.event missing.'); });
      if(!deliverConfig.snapshot)    
        return q.fcall(function () { throw new ValidationError('deliverConfig.snapshot missing.'); });
        
      // ToDo
      throw new Error('not implemented');
    };
      
    model.register = function(config) {
      var defer = q.defer();
      model.forceFullWrite = true; // always write new data from config
      config.id = config.subscriberKey + '.' + config.namespace; // UPSERT
      model.data = config;
      model.save()
      .then(function(result){
        defer.resolve(result);
      })
      .fail(function(err) {
        log.error(err, {name:'subscriber.register', config: config});
        return defer.reject(err);
      });
      return defer.promise;
    }
    
    model.deleteForSubscriber = function(subscriberKey) {
      var defer = q.defer();
      
      model.search("subscriberKey:" + subscriberKey)
      .then(function(toDelete) {
        var innerDefer = q.defer();
        toDelete = model.unwrapResultRecords(toDelete);
        var i = toDelete.length;
        _.each(toDelete, function(d) {
          model.delete(d.id)
          .then(function() {
            i--;
            if(i === 0)
              innerDefer.resolve(toDelete.length);
          })
          .fail(function(err) {
            innerDefer.reject(err);
          })
        });
        return innerDefer.promise;
      })
      .then(function(deleteCnt) {
        defer.resolve(deleteCnt);
      })
      .fail(function(err) {
        log.error(err, {name:'subscriber.deleteForSubscriber', subscriberKey: subscriberKey});
        return defer.reject(err);
      });
      
      return defer.promise;
    }
    
    // use subscriberKey+namespace as subscriber-id
    // just save(forceIndex) all eventSubscriptions (so no problem if muliple instances register parallel)
    // try to remove old subscriptions (allow to fail, which can happen when multiple instances and one is late)
    model.saveSubscriptions = function(subscriptionsConfig) {
      var defer = q.defer();
      var savedSubscriptions = [];
      
      if(subscriptionsConfig.events.length === 0)
        return model.deleteForSubscriber(subscriptionsConfig.subscriberKey);
      
      writeSubs() // write subscriptions
      .then(function() { // get existing subscriptions
        var query = 'subscriberKey:' + subscriptionsConfig.subscriberKey;
        return model.search(query);
      })
      .then(function(allSubs) { // find subscriptions which are not provided in subscriptionsConfig
        allSubs = model.unwrapResultRecords(allSubs);
        var subscriptionsToDelete = [];
        _.each(allSubs, function(es) {
          if(!_.findWhere(subscriptionsConfig.events, {namespace: es.namespace})) {
            subscriptionsToDelete.push(es.id);
          }
        });
        return deleteSubs(subscriptionsToDelete); // delete 'old' subscriptions
      })
      .then(function() { // success
        defer.resolve(savedSubscriptions);
      })
      .fail(function(err) {
        log.error(err, {name: 'subscriber.saveSubscriptions', subscriptionsConfig: subscriptionsConfig});
        defer.reject(err);
      });
      
      // write 
      function writeSubs() {
        if(subscriptionsConfig.events.length === 0)
          return q.fcall(function () { return []; });
          
        var writeDefer = q.defer();
        var i = subscriptionsConfig.events.length;
        _.each(subscriptionsConfig.events, function(subscriptionConfig) {
          subscriptionConfig.subscriberKey = subscriptionsConfig.subscriberKey;
          self.new().register(subscriptionConfig)
          .then(function(savedSub) {
            i--;
            savedSubscriptions.push(savedSub);
            if(i === 0)
              return writeDefer.resolve();
          })
          .fail(function(err) {
            writeDefer.reject(err);
          });
        });
        return writeDefer.promise;
      }
      
      // delete
      function deleteSubs(subsToDelete) {
        if(!subsToDelete || subsToDelete.length === 0)
          return q.fcall(function () { return 0; });
          
        
        var deleteDefer = q.defer();
        var i = subsToDelete.length;
        var reallyDeleted = 0;
        _.each(subsToDelete, function(delSub) {
          self.new().delete(delSub)
          .then(function() {
            reallyDeleted++;
            i--;
            if(i === 0)
              return deleteDefer.resolve(reallyDeleted);
          })
          .fail(function(err) {
            if(err.message && err.message.indexOf('DocumentMissingException') !== -1) {
              i--;
              if(i === 0) // may fail if another instance was quicker
                return deleteDefer.resolve(reallyDeleted);
            }
            else {
              deleteDefer.reject(err);          
            }
          });
        });
        return deleteDefer.promise;
      }
      
      return defer.promise;
    }
    
    return model;
  }
  
  return this.new();
};

module.exports =  Subscriber;