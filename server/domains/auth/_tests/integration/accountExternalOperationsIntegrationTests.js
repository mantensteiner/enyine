var assert = require("assert"),
    Q = require("Q"),
    _ = require("underscore"),
    idGen = require("../../../utils/idGen"),
    AuthenticationError = require("../../../utils/errors").AuthenticationError,
    Account = require("../../../domains/auth/models/account"),
    AccountStats = require("../../../domains/auth/models/accountStats");

describe('Account', function() {
  var model = Account({user:{username:'birdo'}});
  var accountData = {
    id: '402efc2ee6874df6a9375631ba1647d0', 
    provider:'Google', 
    email:'mantenpanther@gmail.com', 
    username:'solid_testsnake_google', 
    name:'Solid TestSnake Google Account', 
    userId: idGen(),
    accessToken: '52473567436952052734'
  };
  // Mock event store
  model.logEvent = function(operation, id, description) { 
    return Q.fcall(function () { 
      return model.data; 
    });  
  }
  
  // Cleanup is now done afterwards by id, keep for documentation
  /*
  before(function(done) {
    this.timeout(10000);
    
    var accountStats = AccountStats({user:{username:'birdo'}});
    accountStats.logEvent = model.logEvent;
    accountStats.search("username:"+accountData.username)
    .then(function(statsData) {
      var i = 0;
      if(statsData.length === undefined) {
        statsData = model.unwrapResultRecords(statsData);
        i = statsData.length;
      }
      
      if(i == 0) {
        model.delete(accountData.id)
        .then(function() {
          setTimeout(done, 1500);
        })
        .fail(function(err) {
          setTimeout(done, 1500);
        });
      } else {
        _.each(statsData, function(sd) {
          accountStats.delete(sd.id)
          .then(function() {
            i--;
            if(i==0) {
              model.delete(accountData.id)
              .then(function() {
                setTimeout(done, 1500);
              })
              .fail(function(err) {
                setTimeout(done, 1500);
              });
            }
          })
          .fail(function(err) {
            setTimeout(done, 1500);
          });
        });
      }
    });
  });
  */
  
  after(function(done) {
    this.timeout(10000);
    setTimeout(function() {
      Account({user:{username:'birdo'}, skipAuth: true})
      .deleteByQuery('402efc2ee6874df6a9375631ba1647d0')
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
    }, 1000);
    
    setTimeout(function() {
      AccountStats({user:{username:'birdo'}, skipAuth: true})
      .deleteByQuery('402efc2ee6874df6a9375631ba1647d0')
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
    }, 1000);    
  });
  
  var authToken = '';  
  it('.login() should create a new fake "Google" account & login the user', function(done) {
    this.timeout(10000);
    model.loginExternal(accountData)
    .then(function(account) {
      authToken = account.token;
      assert.equal(!account.accessTokenGoogle, false); // has google token
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  it('.logout() should destroy the session', function(done) {
    model.logout(authToken)
    .then(function(result) {
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
});