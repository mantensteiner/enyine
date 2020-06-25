
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Account = require('../models/account');

var localStrategy = new LocalStrategy(
  function(username, password, done) {
    Account({unauthenticatedOperation: true})
    .login({ // login
      username: username,
      password: password
    })
    .then(function(account) {
      return done(null, account); // success
    })
    .fail(function(err) { // error
      if(err.code === 401)
        return done(null, false, { message: err.message}); 
      return done(new Error('An error occured during login.'));
    });
  });

module.exports = {
  configure: function(pass){
    pass.use(localStrategy);
  }
};