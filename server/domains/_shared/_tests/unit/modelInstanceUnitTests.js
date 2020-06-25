var assert = require("assert"),
		TestModel = require('./testModel'),
    ValidationError = require('../../../../utils/errors').ValidationError;
		
// Document how models work
describe('TestModel', function() {
  var repo = {}; // repo = null would activate the default repository
  var logger = { error: function(){} };
	
    it('should return different instances', function (done) {
			
			// Usage: 
      // PER INSTANCE 
      // var m = new TestModel({data: {}, ...});
      // m.create();
      var config = {
        index: 'testindex',
        type: 'testtype',
        user: {username:'birdo'},
        fields: ['f1', 'f2'],
        repository: repo, // mock repo
        data: {test:'test123'}
      };
      
			var m1 = TestModel(config);
      // delay... yeah this is bad
      setTimeout(function() {
        var m2 = TestModel(config);
        assert.notEqual(m1.data.timestamp, m2.data.timestamp);
        
        // set data (or any other config value) after initialization also possible
        //m1.data.test = 'test123';
        
        m1.create()
        .then(function(createData) {
          assert.equal('test123', createData.test);
          done();
        })
        .fail(function(err) {
          done(err);
        });
      }, 5);
    });
});