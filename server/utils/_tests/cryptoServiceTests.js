
var assert = require("assert"),
		cryptoService = require('../cryptoService');
		
describe('CryptoService', function() {
		var salt = '';
		var hash = '';
		var pass = 'pa$$word1';	
				
	  before(function(done) {
			cryptoService.genSalt()
			.then(function(_salt) {
				salt = _salt;
				return cryptoService.hashPassword(pass, salt);
			})
			.then(function(_hash) {
				hash = _hash;
				done();
			})
			.fail(function(err) {
				done(err);
			});
	  });
		
    it('should succeed by comparing the correct password', function (done) {
			cryptoService.compare(pass, hash)
			.then(function(result) {
				// should be true, password matches
      	assert.equal(true, result);
				done();
			})
			.fail(function(err) {
				done(err);
			});
    });
		
    it('should fail given a wrong password', function (done) {
		var passFail = 'pa$$word_FAIL';	
			cryptoService.compare(passFail, hash)
			.then(function(result) {
				// should be false, password is wrong 
      	assert.equal(false, result);
				done();
			})
			.fail(function(err) {
				done(err);
			});
    });
});