var assert = require("assert"),
    moment = require("moment"),
		Quantity = require("../models/quantity");
		
describe('Quantity', function() {
  it('should be initialized with index "quantity" and type "quantity"', function () {
    var account = Quantity({repository:{}, user:{username:'birdo'}});
    assert.equal('quantity', account.index);
    assert.equal('quantity', account.type);
  });
});