var assert = require("assert"),
    moment = require("moment"),
		idGen = require("../../../utils/idGen"),
    rewire = require("rewire"),
    q = require("q"),
    _ = require("underscore"),
    addRelations = rewire("../logic/relations/addRelations"),
    removeRelations = rewire("../logic/relations/removeRelations");    
    

var ItemMock = function(config) {
  return {
    search: function(query) {
      return q.fcall(function() {
        if(query.indexOf('targetItemNames') !== -1)
          return [{
            id: 1,
            name: 'Target Item X'
          },{
            id: 2,
            name: 'Target Item Y'
          }];
        if(query.indexOf('sourceItemNames') !== -1)
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

        if(query.indexOf('targetItemsRemove') !== -1)
          return [{
            id: 700,
            name: 'Source Item A',
            relations: [{
              id: 802,
              name: 'Should not be removed'
            }]
          },{
            id: 701,
            name: 'Source Item B',
            relations: [{
              id: 701,
              name: 'Source Item B'
            },{
              id: 802,
              name: 'Should not be removed'
            }]
            },{
              id: 702,
              name: 'Source Item C', 
              relations: [{
              id: 701,
                name: 'Source Item B'
              },{
                id: 702,
                name: 'Source Item C'
              }]
            }];
                    
        if(query.indexOf('sourceItemsRemove') !== -1)
          return [{
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
		
describe('Item addRelations', function() {
  
  addRelations.__set__("Item", ItemMock);

  it('should add relations to the source and target items', function (done) {
    var relationConfig = {
      user: {username: 'birdo'},
      spaceId: idGen(),
      targetQuery: 'name:targetItemNames*',
      sourceQuery: 'name:sourceItemNames*'
    }
    addRelations(relationConfig)
    .then(function(changedItems) {
      assert.equal(changedItems.targetItems.length, 2);
      assert.equal(changedItems.sourceItems.length, 3);
      
      assert.equal(changedItems.targetItems[0].relations.length, 3);
      assert.equal(changedItems.sourceItems[2].relations.length, 2);
    
      var targetItem2 = _.findWhere(changedItems.targetItems, {id:2})
      var allRelated = (_.where(targetItem2.relations, {id:700}).length == 1 && 
        _.where(targetItem2.relations, {id:701}).length == 1 && 
        _.where(targetItem2.relations, {id:702}).length == 1);
      
      assert.equal(allRelated, true);
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  removeRelations.__set__("Item", ItemMock);
  
  it('should remove the relations between the source and target items', function (done) {
    var relationConfig = {
      user: {username: 'birdo'},
      spaceId: idGen(),
      targetQuery: 'targetItemsRemove',
      sourceQuery: 'sourceItemsRemove'
    }
    removeRelations(relationConfig)
    .then(function(changedItems) {
      
      //var item700 = _.findWhere(changedItems.targetItems, {id: 700});
      //assert.equal(item700.relations.length, 1);
      var item701 = _.findWhere(changedItems.targetItems, {id: 701});
      assert.equal(item701.relations.length, 1);
      var item702 = _.findWhere(changedItems.targetItems, {id: 702});
      assert.equal(item702.relations.length, 0);
      
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
});