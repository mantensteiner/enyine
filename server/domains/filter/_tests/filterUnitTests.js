var assert = require("assert"),
    moment = require("moment"),
		Filter = require("../models/filter");
		
describe('Filter', function() {
  it('should be initialized with index "filter" and type "filter"', function () {
    var account = Filter({repository:{}, user:{username:'birdo'}});
    assert.equal('filter', account.index);
    assert.equal('filter', account.type);
  });
});