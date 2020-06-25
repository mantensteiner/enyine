var assert = require("assert"),
    Q = require("Q"),
    idGen = require("../../utils/idGen"),
    BaseModel = require("../../domains/_shared/baseModel"),
    esMaintenanceRepo = require("../../../mgmt/elasticsearch/esRepository");

/*
    BaseModel create,update,delete
*/
describe('BaseModel create,update,delete', function() {
  var indexName = 'integration_test_crud';
  var indexNameAlias = 'integration_test_crud_alias';
  var typeName = 'testType';
  
  before(function(done) {
    // check if index for tests exists and delete if so
    esMaintenanceRepo.indexExists(indexName)
    .then(function(exists) {
      if(exists)
        return esMaintenanceRepo.deleteIndex(indexName);
      else
        done();
    })
    .then(function() {
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  
  describe('EsMaintenanceRepo', function() {
    it('should create index "' + indexName + '"', function(done) {
      esMaintenanceRepo.createIndex(indexName)
      .then(function() {
        // since we're already going, also create alias...         
        return esMaintenanceRepo.setAlias(indexName, indexNameAlias);
      })
      .then(function() {
        return esMaintenanceRepo.getAlias(indexName, indexNameAlias);
      })
      .then(function(aliasInfo) {
        if(aliasInfo[indexName].aliases[indexNameAlias])
          return done(); 
        done(new Error('Alias ' + indexNameAlias + ' does not exist'));
      })
      .fail(function(err) {
        done(err);
      });
    });
  });
  
  describe('BaseModel', function() {
    var recordId = idGen();
    var model = BaseModel.create({index:indexName, type: typeName, user:{username:'birdo'}}, null);
    // Mock event store
    model.logEvent = function(operation, id, description) { 
      return Q.fcall(function () { 
        return model.data; 
      });  
    }
  
    it('should be of index "'+indexName+'" and type "'+typeName+'"', function(done) {
      assert.equal(indexName, model.index);
      assert.equal(typeName, model.type);
      done();
    });
      
    describe('.save()', function() {
      it('should save record in index "'+indexName+'" and type "'+typeName+'"', function(done) {
        model.data = {id: recordId, name:'some name for test', email:'test@gmail.com'};
        model.create()
        .then(function() {
          done();
        }, function(error) {
          console.log(error)
          done(error);
        });
      });
    });

    describe('.update()', function() {
      it('should update record', function(done) {
      model.data = {id:recordId, email:'UPDATE@gmail.com'};
      model.save()
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
      });
    });
        
    describe('.delete()', function() {
      it('should delete record', function(done) {
      model.delete(recordId)
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
      });
    });
    
  });
  
  describe('EsMaintenanceRepo', function() {
    it('should delete index ' + indexName, function(done) {
      esMaintenanceRepo.deleteIndex(indexName)
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });
  });
  
});



/*  
    BaseModel read,queries
*/

describe('BaseModel read,queries', function() {
  var indexName = 'integration_test_read';
  var typeName = 'testType';
  
  before(function(done) {
    // check, delete, create new test index
    esMaintenanceRepo.indexExists(indexName)
    .then(function(exists) {
      if(exists)
        return esMaintenanceRepo.deleteIndex(indexName);
      else
        done();
    })
    .then(function() {
      return esMaintenanceRepo.createIndex(indexName);
    })
    .then(function() {
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  describe('BaseModel', function() {
    var recordId = idGen();
    var model = BaseModel.create({index:indexName, type: typeName, user:{username:'birdo'}}, null);
    // Mock event store
    model.logEvent = function(operation, id, description) { 
      return Q.fcall(function () { 
        return model.data; 
      });  
    }
      
    describe('.create() 10 records', function() {
      it('should create 10 records in index "'+indexName+'" and type "'+typeName+'"', function(done) {
        // increase timeout here
        this.timeout(10000);
        var ctr = 10;
        createRecord();
        function createRecord() {
          model.data = {
            id: ctr.toString(), 
            name:'some name for test_record' + ctr, 
            even: ctr % 2 == 0 ? true : false,
            email:'test'+ctr+'@gmail.com'};
          model.create()
          .then(function() {
            ctr--;
            if(ctr > 0) {
              return createRecord();
            }
            else {
              setTimeout(function() {
                return done();
              }, 1500);
            } 
          }, function(error) {
            console.log(error)
            done(error);
          });
        }
      });
    });

    describe('.count()', function() {
      it('should count 10 records', function(done) {
        model.count(/* query */) // count all
        .then(function(nrOfRecords) {
          assert.equal(10, nrOfRecords);
          done();
        })
        .fail(function(err) {
          done(err);
        });
      });
    });
    
    describe('.getById()', function() {
      it('should get record nr 7', function(done) {
        model.getById("7")
        .then(function(record) {
          assert.equal("test7@gmail.com", record.email);
          done();
        })
        .fail(function(err) {
          done(err);
        });
      });
    });
    
    describe('.findOne()', function() {
      it('should search all records containing "email:test7", sorted descending by id', function(done) {
        model.sortField = 'id';
        model.sortDir = 'asc';
        model.findOne('email:test7')
        .then(function(record) {
          assert.equal(7, record.id);
          done();
        })
        .fail(function(err) {
          done(err);
        });
      });
    });  
    
    describe('.get()', function() {
      it('should get all records, sorted descending by id', function(done) {
        model.sortField = 'id';
        model.sortDir = 'desc';
        model.get()
        .then(function(records) {
          assert.equal(10, records.length);
          // index is not 3 because sorting for id goes 9=1,8=10,7=2,...
          assert.equal("7", records[2].id);
          done();
        })
        .fail(function(err) {
          done(err);
        });
      });
    });
    
    describe('.search()', function() {
      it('should search all records whose field "even" is true, sorted ascending by id', function(done) {
        model.sortField = 'id';
        model.sortDir = 'asc';
        model.search('even:true')
        .then(function(records) {
          assert.equal(5, records.hits.hits.length);
          // sort order for 10 is early...
          assert.equal("10", records.hits.hits[0]._source.id);
          done();
        })
        .fail(function(err) {
          done(err);
        });
      });
    });
    
    describe('.search() with aggregation', function() {
      it('should count all records whose field is not "even" by an aggregation', function(done) {
        var agg = { 
          only: true,
          id_count : { "value_count" : { "field" : "id" } }
        };
        
        model.search('even:false', agg)
        .then(function(result) {
          assert.equal(5, result.aggs.id_count.value);
          done();
        })
        .fail(function(err) {
          done(err);
        });
      });
    });
    
    describe('EsMaintenanceRepo', function() {
      it('should delete index ' + indexName, function(done) {
        esMaintenanceRepo.deleteIndex(indexName)
        .then(function() {
          done();
        })
        .fail(function(err) {
          done(err);
        });
      });
    });
  });
});