var assert = require("assert"),
    _ = require('underscore'),
    Q = require("Q"),
    idGen = require("../../utils/idGen"),
    Subscriber = require("../../domains/event/models/subscriber"),
    Delivery = require("../../domains/event/models/delivery"),
    recordId = idGen(),
    testSubscriptions = {
      subscriberKey: "enyine.internal.test",
      events: [{
    		  namespace: 'user.user.update',
          // fieldChanges: ['email'] - only fire if the given fields are changed
          targetMethod: 'post',
          targetUrl: '/api/auth/updateAccount',
          description: 'update email in account if changed on user',
          active: true
    	  },
        {
    		  namespace: 'space.space.create',
          // fieldChanges: ['email'] - only fire if the given fields are changed
          targetMethod: 'post',
          targetUrl: '/api/auth/updateAccount',
          description: 'update account with space info',
          active: true
    	  }]
    },
    eventData = {
      operation: 'create',
      namespace: 'item.create',
      spaceId: idGen(),
      recordId: recordId,
      sourceConfig: {
        type: 'item',
        excludeFieldsFromEventlog: null
      },
      //description: '',
      sourceData: {
        id: recordId, 
        name:'a new item for testing'
      }
    },
    snapshotData = {
      "id": "029dd263e3dd4923ac0a5ecdb79d6bec",
      "spaceId": "5184eae35d364f7089e6fb661bd78fc1",
      "timestamp": "2015-08-08T13:22:49.281Z",
      "recordId": "59b6a703e04647d2bd780b4b80fdd5b6",
      "type": "item",
      "data": {
        "item": {
          "id": "59b6a703e04647d2bd780b4b80fdd5b6",
          "name": "a new item for testing"
        }
      }
    };

describe('Subscriber', function() {
  
  after(function(done) {
    this.timeout(10000);
    
    setTimeout(function() {
      Subscriber({user:{username:'birdo'}, skipAuth: true})
      .deleteByQuery(recordId) // delete all event data for the record id
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
    }, 1000); 
    
    setTimeout(function() {
      Delivery({user:{username:'birdo'}, skipAuth: true})
      .deleteByQuery('enyine.internal.testitem.create') // delete expected failed delivery
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
    }, 1000); 
  });
    
  it('.saveSubscriptions() should save subscriptions', function(done) {
    var subscriber = Subscriber({user: {username:'snakebiter', id: idGen()}, skipAuth: true});
    subscriber.validateSubscriptions(testSubscriptions)
    .then(function(subscriptionsConfig) {
      return subscriber.saveSubscriptions(subscriptionsConfig);
    })
    .then(function(result) {
      assert.equal(testSubscriptions.events.length, result.length);
      assert.equal(testSubscriptions.subscriberKey, result[0].subscriberKey);
      assert.equal(testSubscriptions.subscriberKey, result[1].subscriberKey);
      
      assert.equal(testSubscriptions.events[0].namespace, 
        _.findWhere(result, {namespace: testSubscriptions.events[0].namespace}).namespace);
      assert.equal(testSubscriptions.events[1].namespace, 
        _.findWhere(result, {namespace: testSubscriptions.events[1].namespace}).namespace);
      done();
    })
    .fail(function(error) {
      done(error);
    });
  });
  
  it('.saveSubscriptions() should remove, update & add a new subscription', function(done) {
    var subscriber = Subscriber({user: {username:'snakebiter', id: idGen()}, skipAuth: true});
    
    // update event
    testSubscriptions.events[0].description = "CHANGED DESCRIPTION";
    // remove event
    testSubscriptions.events.splice(1,1);
    // add new event
    testSubscriptions.events.push({
  		  namespace: 'item.create',
        // fieldChanges: ['email'] - only fire if the given fields are changed
        targetMethod: 'post',
        targetUrl: '/someDomain/doSomethingBecauseItemWasUpdated',
        description: 'do something because of item update',
        active: true
  	  });
    
    subscriber.validateSubscriptions(testSubscriptions)
    .then(function(subscriptionsConfig) {
      return subscriber.saveSubscriptions(subscriptionsConfig);
    })
    .then(function(result) {
      assert.equal(testSubscriptions.events.length, result.length);
      assert.equal(testSubscriptions.subscriberKey, result[1].subscriberKey);
      assert.equal(testSubscriptions.events[1].namespace, 
      _.findWhere(result, {namespace: testSubscriptions.events[1].namespace}).namespace);
      
      setTimeout(done, 1000);
    })
    .fail(function(error) {
      done(error);
    });
  })


  it('should deliver to all subscribers to an event', function(done) {
    var subscriber = Subscriber({user: {username:'snakebiter', id: idGen()}, skipAuth: true});
    subscriber.deliverInternal({event: eventData, snapshot: snapshotData})
    .then(function(deliveries) {
      assert.equal(deliveries.length, 1);
      // delivery should have failed (no recipient in this test case)
      assert.equal(500, deliveries[0].httpResponseCode); 
      done();
    })
    .fail(function(error) {
      done(error);
    });
  });
  
  it('.saveSubscriptions() with empty event array should remove all subscriptions', function(done) {
    var subscriber = Subscriber({user: {username:'snakebiter', id: idGen()}, skipAuth: true});
    
    // blank overwrite subscriptions
    testSubscriptions.events = [];
    
    subscriber.saveSubscriptions(testSubscriptions)
    .then(function(result) {     
      done();
    })
    .fail(function(err) {
      done(err);
    });
    
  });
  
});