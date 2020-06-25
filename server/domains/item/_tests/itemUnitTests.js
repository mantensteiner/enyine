var assert = require("assert"),
    moment = require("moment"),
		Item = require("../models/item");
		
describe('Item', function() {
  it('model should have space index and type set', function () {
    var space = Item({repository:{}, user: {username:'birdo'}});
    assert.equal('item', space.index);
    assert.equal('item', space.type);
  });
});