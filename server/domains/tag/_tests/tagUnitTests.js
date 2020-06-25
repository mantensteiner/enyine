var assert = require("assert"),
    moment = require("moment"),
		Tag = require("../models/tag");
		
describe('Tag', function() {
  it('should be initialized with index "tag" and type "tag"', function () {
    var account = Tag({repository:{}, user:{username:'birdo'}});
    assert.equal('tag', account.index);
    assert.equal('tag', account.type);
  });
});