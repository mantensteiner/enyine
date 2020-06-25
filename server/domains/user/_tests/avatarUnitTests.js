
var assert = require("assert"),
    moment = require("moment"),
		Avatar = require("../models/avatar");
		
describe('Avatar', function() {
  it('should be initialized with index "user" and type "avatar"', function () {
    var account = Avatar({repository:{}, user:{username:'birdo'}});
    assert.equal('user', account.index);
    assert.equal('avatar', account.type);
  });
});