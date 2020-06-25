var assert = require("assert"),
    Q = require("Q"),
    idGen = require("../../utils/idGen"),
    Event = require("../../domains/event/models/event"),
    Snapshot = require("../../domains/event/models/snapshot"),
    Delivery = require("../../domains/event/models/delivery"),
    Subscriber = require("../../domains/event/models/subscriber");

describe('Event', function() {
  var recordId = idGen();
  var writeResult = null;
  
  after(function(done) {
    this.timeout(10000);
    setTimeout(function() {
      Event({user:{username:'birdo'}, skipAuth: true})
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
      .deleteByQuery(recordId) // delete all event data for the record id
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
    }, 1000);
    
    setTimeout(function() {
      Snapshot({user:{username:'birdo'}, skipAuth: true})
      .deleteByQuery(recordId) // delete all snapshot data for the record id
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
    }, 1000);    
  });
  
  describe('.write()', function() {
    it('should write event with snapshot', function(done) {
      var event = Event({user: {username:'snakebiter', id: idGen()}, skipAuth: true});
      event.validate({
        operation: 'create',
        namespace: '/item/create',
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
      })
      .then(function(eventConfig) {
        return event.write(eventConfig);
      })
      .then(function(result) {
        writeResult = result;
        assert.equal(recordId, result.event.recordId);
        assert.equal(recordId, result.snapshot.data.item.id );
        done();
      })
      .fail(function(error) {
        done(error);
      });
      
    });
  });
  
  describe('.delete()', function() {
    it('should delete event', function(done) {
    var modelConfig = {user: {username:'snakebiter', id: idGen()}, skipAuth: true};
    Event(modelConfig)
    .delete(writeResult.event.id)
    .then(function() {
      done();
    })
    .fail(function(err) {
      done(err);
    });
    });
  });
  
  describe('Snapshot.delete()', function() {
    it('should delete snapshot', function(done) {
    var modelConfig = {user: {username:'snakebiter', id: idGen()}, skipAuth: true};
    Snapshot(modelConfig)
    .delete(writeResult.snapshot.id)
    .then(function() {
      done();
    })
    .fail(function(err) {
      done(err);
    });
    });
  });
  
});