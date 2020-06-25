var assert = require("assert"),
    moment = require("moment"),
		Bookmark = require("../models/bookmark");
		
describe('Bookmark', function() {
  it('should be initialized with index "bookmark" and type "bookmark"', function () {
    var account = Bookmark({repository:{}, user:{username:'birdo'}});
    assert.equal('bookmark', account.index);
    assert.equal('bookmark', account.type);
  });
});