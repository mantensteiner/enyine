var assert = require("assert"),
    Q = require("Q"),
    idGen = require("../../../utils/idGen"),
    Account = require("../../../domains/auth/models/account");

describe('Account', function() {
  var accountId = idGen();
  var model = Account({user:{username:'birdo'}});
  // Mock event store
  model.logEvent = function(operation, id, description) { 
    return Q.fcall(function () { 
      return model.data; 
    });  
  }
  
  model.data = {id: accountId, username:'snakebiter', email:'snakebiter@gmail.com', userId: idGen()};
  
  describe('.create()', function() {
    it('should create account', function(done) {
      model.create()
      .then(function() {
        done();
      })
      .fail(function(error) {
        done(error);
      });
    });
  });
  
  describe('.save()', function() {
    it('should save account', function(done) {
      model.data = {id: accountId, username:'snakebiter', email:'snakebiter_THECHANGE@gmail.com', userId: idGen()};
      model.save()
      .then(function() {
        done();
      })
      .fail(function(error) {
        done(error);
      });
    });
  });
  
  describe('.delete()', function() {
    it('should delete account', function(done) {
    model.delete(accountId)
    .then(function() {
      done();
    })
    .fail(function(err) {
      done(err);
    });
    });
  });
  
});