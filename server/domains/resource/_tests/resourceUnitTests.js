var assert = require("assert"),
    moment = require("moment"),
		Resource = require("../models/resource");
		
describe('Resource', function() {
  it('should be initialized with index "resource" and type "resource"', function () {
    var account = Resource({repository:{}, user:{username:'birdo'}});
    assert.equal('resource', account.index);
    assert.equal('resource', account.type);
  });
});