var assert = require("assert"),
    q = require("q"),
    _ = require("underscore"),
    idGen = require("../../utils/idGen"),
    Search = require("../../domains/search/models/search"),
    ItemType = require("../../domains/itemtype/models/itemtype"),
    Space = require("../../domains/space/models/space");
		
describe('Search', function() {
  var toDelete = [];
  var spaceNr = 5;
  var itemTypeNr = 5;
  
  var operationId = '43itzi34hh783457g4h27hhg2';
  
  before(function(done) {
    this.timeout(10000);
    // create a few records
    var cnt = {
      space:{ nr: spaceNr, model: Space, counter: 0 },
      itemtype: { nr: itemTypeNr, model: ItemType, counter: 0 } 
    };
    
    _.each(_.keys(cnt), function(domain) {
      for(var i = 0; i < cnt[domain].nr; i++) {
        createRecord(domain, cnt[domain].model);
      }
    });
    
    function createRecord(recordType, Model) {
       cnt[recordType].counter++;
      var model = Model({
        skipAuth: true,
        user:{username:'birdo', id:'2334534'},
        data: {
          id: idGen(), 
          name: operationId + '_test_'+ cnt[recordType].counter + '_for_testing_' + recordType
        }
      });
      model.logEvent = function(operation, id, description) { 
        return q.fcall(function () { 
          return model.data; 
        });  
      };
      model.create()
      .then(function() {
        cnt[recordType].nr--;
        toDelete.push({domain: recordType, id: model.data.id, model: Model});
      })
      .fail(function(error) {
        done(error);
      });
    }
    
    syncItems();
    function syncItems() {
      if(cnt.space.nr == 0 && cnt.itemtype.nr == 0)
        return setTimeout(done, 1000);
      else 
        setTimeout(syncItems, 500);
    }
  });
  
  it('should search globally over all whitelisted domains', function (done) {
    var domainConfig = {
      space: ['space'],
      itemtype: ['itemtype']
    }
    Search({skipAuth: true, user:{username:'birdo'}})
    .searchGlobal('name:*test_4*', domainConfig)
    .then(function(result) {
      assert.equal(result.length, 2);
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  
  after(function(done) {
    this.timeout(10000);
    
    var entityCnt = 2;
    setTimeout(function() {
      Space({user:{username:'birdo'}, skipAuth: true})
      .deleteByQuery('name:' + operationId + '*')
      .then(function() {
        entityCnt--;
        if(entityCnt == 0)
          done();
      })
      .fail(function(err) {
        done(err);
      });
    }, 1000);
    
    setTimeout(function() {
      ItemType({user:{username:'birdo'}, skipAuth: true})
      .deleteByQuery('name:' + operationId + '*')
      .then(function() {
        entityCnt--;
        if(entityCnt == 0)
          done();
      })
      .fail(function(err) {
        done(err);
      });
    }, 1000);
    
    /*_.each(toDelete, function(del) {
      deleteRecord(del.domain, del.id, del.model)
      .then(function() {
        delCnt--;
      })
      .fail(function(err) {
        done(err);
      });
    });
    
    var delCnt = spaceNr + itemTypeNr;
    
    function deleteRecord(recordType, id, Model) {
      var defer = q.defer();
      
      var model = Model({
        skipAuth: true,
        user:{username:'birdo'}
      });
      model.logEvent = function(operation, id, description) { 
        return q.fcall(function () { 
          return model.data; 
        });  
      };
      model.delete(id)
      .then(function() {
        defer.resolve();
      })
      .fail(function(err) {
        defer.reject(err);
      });
      
      return defer.promise;
    }
    
    syncItems();
    function syncItems() {
      if(delCnt == 0)
        done();
      else 
        setTimeout(syncItems, 500);
    }*/
  });
  
});