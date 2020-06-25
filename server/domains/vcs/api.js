var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    eventSubscriber = require('../_shared/event/eventSubscriber');

exports.register = function(app) {
  app.all('/api/commit/save', ensureAuth(), controller.save);
  app.all('/api/commit/delete/:id', ensureAuth(), controller.del);
  app.all('/api/commit/get', ensureAuth(), controller.get);
  app.all('/api/commit/get/:id', ensureAuth(), controller.getById);
  app.all('/api/commit/search', ensureAuth(), controller.search);
  
  // Register internal eventSubscriptions
  eventSubscriber.saveInternalSubscriptions(eventSubscriptions);
}
