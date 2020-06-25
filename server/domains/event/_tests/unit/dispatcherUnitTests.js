var assert = require("assert"),
    Q = require('q'),
    dispatcher = require("../../distribution/dispatcher"),
		ValidationError = require("../../../../utils/errors").ValidationError;
		
describe('Dispatcher', function() {
  it('should fail on config validation', function (done) {
    // targetUrl, targetMethod, headers, payload
    // incomplete config
    dispatcher.request({
      targetUrl: '',
      targetMethod: ''
    }).
    then(function() {
      done(new Error("Expected validation to fail."));
    })
    .fail(function(err) {
      if(err instanceof ValidationError)
        return done();
      done(err);
    });
  });
  
  it('should make a HTTP request', function (done) {
    var called = false;
    
    // mock request module
    dispatcher.execRequest = function(config) {
       return Q.fcall(function () {  called = true; });
    };
    
    dispatcher.request({
      targetUrl: 'http://dummy',
      targetMethod: 'POST',
      payload: {test:'test'}
    })
    .then(function() {
      if(called)
        return done();
      throw new Error ("Request not called");
    })
    .fail(function(err) {
      done(err);
    });
  });
  
  it('should handle a failed request', function (done) {
    var networkErrMsg = 'Simulated network problem';
    // mock request module
    dispatcher.execRequest = function(config) {
       return Q.fcall( function() { throw new Error(networkErrMsg); });
    };
    
    dispatcher.request({
      targetUrl: 'http://dummy',
      targetMethod: 'POST',
      payload: {test:'test'}
    })
    .then(function() {
      return done(new Error ("Should have failed"));
    })
    .fail(function(err) {
      if(err.message === networkErrMsg)
        return done();
      done(err);
    });
  });
  
});