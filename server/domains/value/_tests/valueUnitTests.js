var assert = require("assert"),
    moment = require("moment"),
		Value = require("../models/value");
		
describe('Value', function() {
  it('should be initialized with index "value" and type "value"', function () {
    var account = Value({repository:{}, user:{username:'birdo'}});
    assert.equal('value', account.index);
    assert.equal('value', account.type);
  });
});