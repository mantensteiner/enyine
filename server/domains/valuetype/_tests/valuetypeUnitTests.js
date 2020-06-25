var assert = require("assert"),
    moment = require("moment"),
		ValueType = require("../models/valuetype");
		
describe('ValueType', function() {
  it('should be initialized with index "valuetype" and type "valuetype"', function () {
    var account = ValueType({repository:{}, user:{username:'birdo'}});
    assert.equal('valuetype', account.index);
    assert.equal('valuetype', account.type);
  });
});