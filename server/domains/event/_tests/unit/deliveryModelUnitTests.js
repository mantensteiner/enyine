var assert = require("assert"),
		Delivery = require("../../models/delivery");
		
describe('Delivery', function() {
  it('should be initialized with index "event" and type "delivery"', function () {
    var model = Delivery({repository:{}, user:{username:'birdo'}});
    assert.equal('event', model.index);
    assert.equal('delivery', model.type);
  });
});