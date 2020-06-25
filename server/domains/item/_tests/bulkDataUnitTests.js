var assert = require("assert"),
    moment = require("moment"),
		idGen = require("../../../utils/idGen"),
    rewire = require("rewire"),
    q = require("q"),
    _ = require("underscore"),
    saveBulkData = rewire("../logic/saveBulkData");
    

var ItemMock = function(config) {
  return {
    search: function(query) {
      return q.fcall(function() {
        return [{
          id: 700,
          name: 'Source Item A'
        },{
          id: 701,
          name: 'Source Item B'
        },{
          id: 702,
          name: 'Source Item C'
        }];
      });
    },
    
    save: function() {
      var self = this;
      return q.fcall(function() {
        return self.data;
      });
    },
    
    unwrapResultRecords: function(input) {
      return input;
    }
  }
}
		
describe('Item saveBulkData', function() {
  
  saveBulkData.__set__("Item", ItemMock);
  
  var newDate = new Date();

  it('should update all target items', function (done) {
    var bulkDataConfig = {
      user: {username: 'birdo'},
      spaceId: idGen(),
      targetQuery: 'name:targetItemNames*',
      bulkData: {
        owner: { id:834, username:'bowser'},
        date: newDate,
        status: { id: 123, name:'testStatus' }
      }
    }
    saveBulkData(bulkDataConfig)
    .then(function(result) {
      assert.equal(result.failedItems.length, 0);
      assert.equal(result.changedItems.length, 3);
      
      assert.equal(result.changedItems[0].date.toISOString(), newDate.toISOString());
      assert.equal(result.changedItems[2].owner.username, 'bowser');
      
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
});