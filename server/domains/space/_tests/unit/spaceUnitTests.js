var assert = require("assert"),
    moment = require("moment"),
		Space = require("../../models/space");
		
describe('Space', function() {
  it('model should have space index and type set', function () {
    var space = Space({repository:{}, user: {username:'birdo'}});
    assert.equal('space', space.index);
    assert.equal('space', space.type);
  });
});