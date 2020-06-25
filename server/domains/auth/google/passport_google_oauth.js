var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    idGen = require('../../../utils/idGen'),
    Account = require('../models/account'),
    config = require('../../../config')();
  
var strategy = new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: config.web.baseUrl + "/auth/google/return"
  },
  function(accessToken, refreshToken, profile, done) {
    Account({unauthenticatedOperation: true})
    .loginExternal({
      accessToken: profile.id ? profile.id : accessToken, 
      provider: 'Google',
      email:  profile._json.email,
      name:  profile._json.name,
    }) // register & login
    .then(function(account) { // success
      return done(null, account);
    })
    .fail(function(err) { 
      if(err.code === 401)
        return done(null, false, { message: err.message}); 
      return done(new Error('An error occured during login.'));
    });    
});

module.exports = {
  configure: function(pass){
    pass.use(strategy);
  }
};