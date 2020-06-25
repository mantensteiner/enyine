var passport = require('passport'),
    ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller'),
    controller_local = require('./local/controller_local'),
    controller_google = require('./google/controller_google'),
    authProviders = require('./authProviders'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    eventSubscriber = require('../_shared/event/eventSubscriber');

module.exports.setupAuth = function(app) {
    authProviders.setup(app);
}

module.exports.register = function(app) {
  // Local strategy & logout
  app.all('/api/auth/login', controller_local.login);
  app.all('/api/auth/register', controller_local.register);
  app.all('/api/auth/reset', controller_local.reset);
  app.all('/api/auth/getUserByToken', controller_local.getUserByToken);
  app.all('/api/auth/activate', controller_local.activate);
  app.all('/api/auth/resetPassword', controller_local.resetPassword);  

  // Google 
  app.all('/api/auth/google/login', controller_google.login);  
  app.all('/api/auth/google/return', passport.authenticate('google', { failureRedirect: '/#/login' }), controller_google.redirect);
    
  // General
  app.all('/api/auth/updateAccount', ensureAuth(), controller.updateAccount);
  app.all('/api/auth/getAuthenticatedUser', ensureAuth(), controller.getAuthenticatedUser);
  app.all('/api/auth/logout', ensureAuth(), controller.logout); 
    
  // ToDo: Github 
  
  app.all('/api/auth/refreshToken', ensureAuth(), controller.refreshToken);
  app.all('/api/auth/invalidateRefreshToken', ensureAuth(), controller.invalidateRefreshToken);
  
  // Register internal eventSubscriptions
  eventSubscriber.saveInternalSubscriptions(eventSubscriptions);
}
