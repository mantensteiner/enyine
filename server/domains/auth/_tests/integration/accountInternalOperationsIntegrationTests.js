var assert = require("assert"),
    Q = require("Q"),
    _ = require("underscore"),
    idGen = require("../../../../utils/idGen"),
    AuthenticationError = require("../../../../utils/errors").AuthenticationError,
    Account = require("../../../../domains/auth/models/account"),
    AccountStats = require("../../../../domains/auth/models/accountStats");

describe('Account', function() {
  var model = Account({user:{username:'birdo'}});
  var operationId = '392efc2ee6874df6a9375631ba1647d0';
  var accountData = {
    id: operationId, 
    username:'solid_testsnake', 
    email:'mantenpanther@gmail.com', 
    userId: idGen(),
    password: 'Pa$$w0rd'
  };
  // Mock event store
  model.logEvent = function(operation, id, description) { 
    return Q.fcall(function () { 
      return model.data; 
    });  
  }
  
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
  });*/
  
  after(function(done) {
    this.timeout(10000);
    setTimeout(function() {
      Account({user:{username:'birdo'}, skipAuth: true})
      .deleteByQuery(operationId)
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
    }, 1000);
    
    setTimeout(function() {
      AccountStats({user:{username:'birdo'}, skipAuth: true})
      .deleteByQuery(operationId)
      .then(function() {
        done();
      })
      .fail(function(err) {
        done(err);
      });
    }, 1000);    
  });
  
  // username, email, password, ip, agent, additionalProperties
  var activationToken = '';  
  it('.register() should create a new account', function(done) {
    this.timeout(10000);
    model.register(accountData)
    .then(function(result) {
      activationToken = result.activationToken;
      assert.equal(!result.passwordHash, true);
      assert.equal(result.activated, false);
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  it('.activate() should activate the account', function(done) {
    this.timeout(10000);
    model.activate({
      token: activationToken
    })
    .then(function(result) {
      assert.equal(result.activated, true);
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  it('.login() with false username should be rejected', function(done) {
    model.login({
      username: accountData.username + '43265752riuzgewqg',
      password: accountData.password,
      ip: 'local.test',
      agent: 'test_runner',
    })
    .then(function(result) {
      done(new Error('Should have failed'));
    })
    .fail(function(err) {
      if(err instanceof AuthenticationError) {
        if(err.code !== 401)
          return done("expected field 'code' with value 401 in error");
        return done();
      }
      done(err);
    });
  });
  
  it('.login() with false password should be rejected', function(done) {
    model.login({
      username: accountData.username,
      password: 'FALSE_PASSWORD',
      ip: 'local.test',
      agent: 'test_runner'
    })
    .then(function(result) {
      done(new Error('Should have failed'));
    })
    .fail(function(err) {
      if(err instanceof AuthenticationError) {
        if(err.code !== 401)
          return done("expected field 'code' with value 401 in error");
        return done();
      }
      done(err);
    });
  });
  
  var authToken = '';
  it('.login() with correct username+password should create a session', function(done) {
    model.login({
      username: accountData.username,
      password: accountData.password,
      ip: 'local.test',
      agent: 'test_runner'
    })
    .then(function(account) {
      // validate SessionCache for token and refresh_token
      assert.equal(!account.token, false); // result-account must have token
      authToken = account.token;
      assert.equal(!account.passwordHash, true);      
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  var resetToken = '';
  it('.requestPasswordReset() should create a activate_token', function(done) {
    this.timeout(10000);
    model.requestPasswordReset({email: accountData.email})
    .then(function(result) {
      resetToken = result.activationToken;
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  it('.executePasswordReset() should change the password', function(done) {
    this.timeout(10000);
    model.executePasswordReset({
      token: resetToken,
      username: accountData.username,
      password: 'testPa$$'
    })
    .then(function(result) {
      assert.equal(result.activationToken, null);
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