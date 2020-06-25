var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    eventSubscriber = require('../_shared/event/eventSubscriber'),
    apiRegistry = require('../_shared/apiRegistry'),
    log = require('../../utils/logger');

exports.register = function(app) {
  app.all('/api/user/createFromAccount', ensureAuth(), controller.createFromAccount);
  app.all('/api/user/get', ensureAuth(), controller.save);
  app.all('/api/user/get/:id', ensureAuth(), controller.getById);
  app.all('/api/user/search', ensureAuth(), controller.search);
  app.all('/api/user/uploadAvatar', ensureAuth(), controller.uploadAvatar);
  app.all('/api/user/getAvatar/:id', controller.getAvatar);
  
  app.all('/api/user/saveSpaceMembers', ensureAuth(), controller.saveSpaceMembers);
  app.all('/api/user/removeSpaceFromMembers', ensureAuth(), controller.removeSpaceFromMembers);
  app.all('/api/user/sendSpaceInvite', ensureAuth(), controller.sendSpaceInvite);
  app.all('/api/user/confirmJoin', ensureAuth(), controller.confirmJoin);
  
  // Register internal eventSubscriptions
  eventSubscriber.saveInternalSubscriptions(eventSubscriptions);
  
  // Register to be exposed for direct, internal domain service calls 
  apiRegistry.register('user', {
     handlers: {
       getById: '/api/user/get/:id', 
       search: '/api/user/search'
     }
  });
}
