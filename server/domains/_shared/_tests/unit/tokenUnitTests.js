
var assert = require("assert"),
		token = require('../../auth/token');
		
describe('Token', function() {
		var exampleToken = 
			'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InNvbWUuZGF0YSI.OLpruDN2pXNQLQeX-npfMoqK0R1n-ZbU7jusiITfzUM';
		var examplePayload = 'some.data';
    it('should encode to JWT', function (done) {
			token.encode(examplePayload)
			.then(function(_token) {
				//assert.equal(exampleToken, token);
				
				var content = token.extractContent(_token);
				
				var parts = _token.split('.');
      	assert.equal(3, parts.length);
				assert.equal(examplePayload, content.payload);
				done();
			})
			.fail(function(err) {
				done(err);
			});
    });
		
    it('should decode from JWT', function (done) {
			token.decode(exampleToken)
			.then(function(payload) {
				assert.equal(examplePayload, payload);
				done();
			})
			.fail(function(err) {
				done(err);
			});
    });
		
  	it('should parse bearer token as given in HTTP authentication headers', function (done) {
			var bearerToken = 'Bearer ' + exampleToken;
			token.parseBearerFromHeader(bearerToken)
			.then(function(_token) {
				assert.equal(exampleToken, _token);
				done();
			})
			.fail(function(err) {
				done(err);
			});
    });
});