var assert = require("assert"),
    moment = require("moment"),
		User = require("../models/user");
		
describe('User', function() {
  it('should be initialized with index "user" and type "user"', function () {
    var account = User({repository:{}, user:{username:'birdo'}});
    assert.equal('user', account.index);
    assert.equal('user', account.type);
  });
});