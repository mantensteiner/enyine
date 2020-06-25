var passport = require('passport'),
    passport_local = require('./local/passport_local');
    passport_google = require('./google/passport_google_oauth');


// Register & setup authentication providers
exports.setup = function(app) {
  
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
  
  // local strategy
  passport_local.configure(passport);
  
  // google strategy
  passport_google.configure(passport);
  
  app.use(passport.initialize());
  app.use(passport.session());
}
