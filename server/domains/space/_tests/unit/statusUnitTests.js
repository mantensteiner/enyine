var assert = require("assert"),
    moment = require("moment"),
		idGen = require("../../../../utils/idGen"),
    rewire = require("rewire"),
    q = require("q"),
    saveStatus = rewire("../../logic/saveStatus"),
    deleteStatus = rewire("../../logic/deleteStatus");    
    

var SpaceMock = function(config) {
  return {
    getById: function() {
      return q.fcall(function() { 
        return {
          id: config.spaceId,
          status: [{        
            id: 1,
            name: 'Open',
            order: 1,
            active: 1,
            limit: 3
          },{        
            id: 2,
            name: 'Selected',
            order: 2,
            active: 1,
            limit: 6
          },{        
            id: 4,
            name: 'Done',
            order: 4,
            active: 0,
            limit: 8
          }]
        } 
      });
    },
    
    save: function() {
      return q.fcall(function() {
        return {
          id: config.data.id,
          status: config.data.status
        } 
      });
    }
  }
}

		
describe('saveStatus', function() {
  
  saveStatus.__set__("Space", SpaceMock);
  
  saveStatus.__set__("sequence", {
    next: function(key) {
     return q.fcall(function() { 
        return 17;
      }); 
    }
  });

  it('should add a status entry to space field', function (done) {
    var statusConfig = {
      spaceId: idGen(),
      user: {username: 'birdo'},
      status: {
        name: 'In Development',
        order: 3,
        active: 1,
        limit: 3
      }
    }
    saveStatus(statusConfig)
    .then(function(_space) {
      assert.equal(_space.status.length, 4);
      assert.equal(_space.status[1].name, 'Selected');
      assert.equal(_space.status[3].id, 17);
      assert.equal(_space.status[3].name, 'In Development');
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
});

describe('deleteStatus', function() {
  
  deleteStatus.__set__("Space", SpaceMock);
  
  it('should remove a status entry to space field', function (done) {
    var statusConfig = {
      spaceId: idGen(),
      user: {username: 'birdo'},
      statusId: 2
    }
    deleteStatus(statusConfig)
    .then(function(_space) {
      assert.equal(_space.status.length, 2);
      assert.equal(_space.status[0].name, 'Open');
      assert.equal(_space.status[1].name, 'Done');
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
});