var assert = require("assert"),
    moment = require("moment"),
		Message = require("../models/message");
		
describe('Message', function() {
  it('should be initialized with index "message" and type "message"', function () {
    var account = Message({repository:{}, user:{username:'birdo'}});
    assert.equal('message', account.index);
    assert.equal('message', account.type);
  });
});