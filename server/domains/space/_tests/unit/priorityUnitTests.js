var assert = require("assert"),
    moment = require("moment"),
		idGen = require("../../../../utils/idGen"),
    rewire = require("rewire"),
    q = require("q"),
    savePriority = rewire("../../logic/savePriority"),
    deletePriority = rewire("../../logic/deletePriority");    
    

var SpaceMock = function(config) {
  return {
    getById: function() {
      return q.fcall(function() { 
        return {
          id: config.spaceId,
          priorities: [{        
            id: 1,
            name: 'Lower than you might think',
            order: 1,
            active: 1
          },{        
            id: 2,
            name: 'Middle',
            order: 2,
            active: 1
          },{        
            id: 4,
            name: 'To the moon',
            order: 4,
            active: 0
          }]
        } 
      });
    },
    
    save: function() {
      return q.fcall(function() {
        return {
          id: config.data.id,
          priorities: config.data.priorities
        } 
      });
    }
  }
}

		
describe('savePriority', function() {
  
  savePriority.__set__("Space", SpaceMock);
  
  savePriority.__set__("sequence", {
    next: function(key) {
     return q.fcall(function() { 
        return 5;
      }); 
    }
  });

  it('should add a priority entry to space field', function (done) {
    var priorityConfig = {
      spaceId: idGen(),
      user: {username: 'birdo'},
      priority: {
        name: 'Holy Moly High',
        order: 3,
        active: 1
      }
    }
    savePriority(priorityConfig)
    .then(function(_space) {
      assert.equal(_space.priorities.length, 4);
      assert.equal(_space.priorities[0].name, 'Lower than you might think');
      assert.equal(_space.priorities[3].id, 5);
      assert.equal(_space.priorities[3].name, 'Holy Moly High');
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
});

describe('deletePriority', function() {
  
  deletePriority.__set__("Space", SpaceMock);
  
  it('should remove a priority entry to space field', function (done) {
    var priorityConfig = {
      spaceId: idGen(),
      user: {username: 'birdo'},
      priorityId: 2
    }
    deletePriority(priorityConfig)
    .then(function(_space) {
      assert.equal(_space.priorities.length, 2);
      assert.equal(_space.priorities[0].name, 'Lower than you might think');
      assert.equal(_space.priorities[1].name, 'To the moon');
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
});