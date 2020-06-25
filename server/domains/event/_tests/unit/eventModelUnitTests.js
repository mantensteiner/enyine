var assert = require("assert"),
		Event = require("../../models/event");
		
describe('Event', function() {
  it('should be initialized with index "event" and type "event"', function () {
    var model = Event({repository:{}, user:{username:'birdo'}});
    assert.equal('event', model.index);
    assert.equal('event', model.type);
  });
});