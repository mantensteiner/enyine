var assert = require("assert"),
    moment = require("moment"),
		Note = require("../models/note");
		
describe('Note', function() {
  it('should be initialized with index "note" and type "note"', function () {
    var account = Note({repository:{}, user:{username:'birdo'}});
    assert.equal('note', account.index);
    assert.equal('note', account.type);
  });
});