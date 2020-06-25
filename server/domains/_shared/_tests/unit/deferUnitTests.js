var assert = require("assert"),
		Q = require('q'),
		TestModel = require('./testModel');
		
describe('Defered', function() {
	
    it('should be called in order', function (done) {
      TestModel({repository:{}, user:{username:'birdo'}})
			.testPromises()
			.then(function(count) {
				assert.equal(0, count);
				done();
			})
			.fail(function(err) {
				done(err);
			});
    });
    
		
		it('should delegate multiple fails', function (done) {
      TestModel({repository:{}, user:{username:'birdo'}})
			.testPromises()
			.then(function(count) {
				return Q.fcall(function() {throw new Error('simulate error');});
			})
			.fail(function(err) {
				return Q.fcall(function() {throw new Error('simulate error in error handler');});
			})
			.fail(function(err) {
				done();
			});
    });
    
});