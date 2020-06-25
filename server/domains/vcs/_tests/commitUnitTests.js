var assert = require("assert"),
    moment = require("moment"),
		Commit = require("../models/commit");
		
describe('Commit', function() {
  it('should be initialized with index "vcs" and type "commit"', function () {
    var commit = Commit({repository:{}, user:{username:'birdo'}});
    assert.equal('vcs', commit.index);
    assert.equal('commit', commit.type);
  });
});