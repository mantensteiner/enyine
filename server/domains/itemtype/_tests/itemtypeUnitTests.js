var assert = require("assert"),
    moment = require("moment"),
		ItemType = require("../models/itemType");
		
describe('ItemType', function() {
  it('should be initialized with index "itemtype" and type "itemtype"', function () {
    var account = ItemType({repository:{}, user:{username:'birdo'}});
    assert.equal('itemtype', account.index);
    assert.equal('itemtype', account.type);
  });
});