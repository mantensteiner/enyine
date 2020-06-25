var assert = require("assert"),
    moment = require("moment"),
		GithubSpace = require("../models/githubSpace");
		
describe('GithubSpace', function() {
  it('should be initialized with index "int_github" and type "repository"', function () {
    var account = GithubSpace({repository:{}, user:{username:'birdo'}});
    assert.equal('int_github', account.index);
    assert.equal('repository', account.type);
  });
});