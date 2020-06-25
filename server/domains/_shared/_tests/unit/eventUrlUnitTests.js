
var assert = require("assert"),
		EventUrl = require('../../event/eventUrl'),
		ValidationError = require('../../../../utils/errors').ValidationError;
		
describe('EventUrl', function() {
		var baseUrl = 'http://localhost:7777';
    it('should build a full Url from relative path', function (done) {
			var eventUrl = EventUrl({eventRegistry: {baseUrl: baseUrl, writeEventUrl: '/event/write'}});
			assert.equal(baseUrl + '/event/write', eventUrl.get('writeEventUrl'));
			done();
    });
		
    it('should use the given Url', function (done) {
			var eventUrl = EventUrl({eventRegistry: {baseUrl: baseUrl, writeEventUrl: 'http://example.com/event/write'}});
			assert.equal('http://example.com/event/write', eventUrl.get('writeEventUrl'));
			done();
    });
		
    it('should use the given Url', function (done) {
			try {
				var eventUrl = EventUrl({/*eventRegistry:{}*/});
				return done(new Error("should fail, no eventRegistry"));
			} catch(err) {
				if(!(err instanceof ValidationError))
					return done(err);
				return done();
			}
    });
		
});