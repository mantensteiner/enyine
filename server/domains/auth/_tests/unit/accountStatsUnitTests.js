var assert = require("assert"),
    moment = require("moment"),
		AccountStats = require("../../models/accountStats");
		
describe('AccountStats', function() {
  it('should be initialized with index "auth" and type "accountStats"', function () {
    var model = AccountStats({repository:{}, user:{username:'birdo'}});
    assert.equal('auth', model.index);
    assert.equal('accountStats', model.type);
  });
});