var assert = require("assert"),
		Snapshot = require("../../models/snapshot");
		
describe('Snapshot', function() {
  it('should be initialized with index "event" and type "snapshot"', function () {
    var model = Snapshot({repository:{}, user:{username:'birdo'}});
    assert.equal('event', model.index);
    assert.equal('snapshot', model.type);
  });
});