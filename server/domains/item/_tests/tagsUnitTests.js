var assert = require("assert"),
    moment = require("moment"),
		idGen = require("../../../utils/idGen"),
    rewire = require("rewire"),
    q = require("q"),
    _ = require("underscore"),
    addTags = rewire("../logic/tags/addTags"),
    removeTags = rewire("../logic/tags/removeTags");    
    

var ItemMock = function(config) {
  return {
    data: config ? config.data || null : null,
    
    search: function(query) {
      return q.fcall(function() {
        return [{
          id: 700,
          name: 'Source Item A'
        },{
          id: 701,
          name: 'Source Item B',
          tags: [{
            id: 11,
            name: 'Existing Tag 1'
          },{
            id: 22,
            name: 'Existing Tag 2'
          }]
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
		
describe('Item addTags', function() {
  
  addTags.__set__("Item", ItemMock);

  it('should add tags to the target items', function (done) {
    var tagsConfig = {
      user: {username: 'birdo'},
      spaceId: idGen(),
      targetQuery: 'name:targetItemNames*',
      tags: [{
        id: 987,
        name: 'Tag abc'
      },{
        id: 7567,
        name: 'Tag xyz'
      }]
    }
    addTags(tagsConfig)
    .then(function(result) {
      assert.equal(result.changedItems.length, 3);
      assert.equal(result.changedItems[0].tags[0].id, 987);
      assert.equal(result.changedItems[1].tags[3].id, 7567);
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  removeTags.__set__("Item", ItemMock);
  
  it('should remove the tags from the target items', function (done) {
    var tagsConfig = {
      user: {username: 'birdo'},
      spaceId: idGen(),
      targetQuery: 'targetItemsRemove',
      tags: [{
        id: 11,
        name: 'Existing Tag 1'
      }]
    }
    removeTags(tagsConfig)
    .then(function(result) {
      assert.equal(result.changedItems.length, 1);
      assert.equal(result.changedItems[0].tags[0].id, 22); // id 22 is left
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
});