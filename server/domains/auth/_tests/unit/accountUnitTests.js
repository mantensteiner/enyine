var assert = require("assert"),
    moment = require("moment"),
		Account = require("../../models/account");
		
describe('Account', function() {
  it('should be initialized with index "auth" and type "account"', function () {
    var account = Account({repository:{}, user:{username:'birdo'}});
    assert.equal('auth', account.index);
    assert.equal('account', account.type);
  });
  
  it('should inizialize with a config object', function () {
    var account = Account({user: {username:'birdo'}, repository:{}});
    assert.equal('birdo', account.user.username);
  });
  
  it('should be active', function () {
    var account = Account({
      user: {username:'birdo'}, 
      repository:{},
      data: {activated: true}
    });
    assert.equal(true, account.isActive());
  });
  
  it('should be suspended for 5 minutes', function () {
    var account = Account({
      user: {username:'birdo'}, 
      repository:{},
      data: {failedLoginAttempts: {nr: 10, date: new Date()}}
    });
    var result = account.isSuspended();
    assert.equal(true, result.isSuspended);
  });
  
  it('should be unsuspended after 5 minutes', function () {
    var sixMinutesAgo = moment(new Date()).subtract(6,'minutes');
    var account = Account({
      user: {username:'birdo'}, 
      repository:{},
      data: {failedLoginAttempts: {nr: 10, date: sixMinutesAgo}}
    });
    var result = account.isSuspended();
    assert.equal(false, result.isSuspended);
  });
});