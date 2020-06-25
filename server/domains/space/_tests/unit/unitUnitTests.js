var assert = require("assert"),
    moment = require("moment"),
		idGen = require("../../../../utils/idGen"),
    rewire = require("rewire"),
    q = require("q"),
    saveUnit = rewire("../../logic/saveUnit"),
    deleteUnit = rewire("../../logic/deleteUnit");    
    

var SpaceMock = function(config) {
  return {
    getById: function() {
      return q.fcall(function() { 
        return {
          id: config.spaceId,
          units: [{        
            id: 1,
            name: 'Effort',
            symbol: 'h',
            medium: 1,
            factors: 0
          },{        
            id: 2,
            name: 'Energy',
            symbol: 'kcal',
            medium: 500,
            factors: 0
          },{        
            id: 4,
            name: 'Body weight',
            symbol: 'kg',
            medium: 80,
            factors: 0
          }]
        } 
      });
    },
    
    save: function() {
      return q.fcall(function() {
        return {
          id: config.data.id,
          units: config.data.units
        } 
      });
    }
  }
}

		
describe('saveUnit', function() {
  
  saveUnit.__set__("Space", SpaceMock);
  
  saveUnit.__set__("sequence", {
    next: function(key) {
     return q.fcall(function() { 
        return 4;
      }); 
    }
  });

  it('should add a unit entry to space field', function (done) {
    var unitConfig = {
      spaceId: idGen(),
      user: {username: 'birdo'},
      unit: {
        name: 'Food intake protein',
        symbol: 'g',
        medium: 20,
        factors: 0
      }
    }
    saveUnit(unitConfig)
    .then(function(_space) {
      assert.equal(_space.units.length, 4);
      assert.equal(_space.units[0].symbol, 'h');
      assert.equal(_space.units[3].id, 4);
      assert.equal(_space.units[3].symbol, 'g');
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
});

describe('deleteUnit', function() {
  
  deleteUnit.__set__("Space", SpaceMock);
  
  it('should remove a unit entry to space field', function (done) {
    var unitConfig = {
      spaceId: idGen(),
      user: {username: 'birdo'},
      unitId: 1
    }
    deleteUnit(unitConfig)
    .then(function(_space) {
      assert.equal(_space.units.length, 2);
      assert.equal(_space.units[0].symbol, 'kcal');
      assert.equal(_space.units[1].symbol, 'kg');
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
});