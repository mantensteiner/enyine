var assert = require("assert"),
		Subscriber = require("../../models/subscriber");
		
describe('Subscriber', function() {
  it('should be initialized with index "event" and type "subscriber"', function () {
    var model = Subscriber({repository:{}, user:{username:'birdo'}});
    assert.equal('event', model.index);
    assert.equal('subscriber', model.type);
  });
});