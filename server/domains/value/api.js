var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    eventSubscriber = require('../_shared/event/eventSubscriber');


exports.register = function(app) {
  app.all('/api/value/save', ensureAuth(), controller.save);
  app.all('/api/value/delete/:id', ensureAuth(), controller.del);
  app.all('/api/value/get', ensureAuth(), controller.get);
  app.all('/api/value/get/:id', ensureAuth(), controller.getById);
  app.all('/api/value/search', ensureAuth(), controller.search);
  
  app.all('/api/value/removeItem', ensureAuth(), controller.removeItem);
  //app.get('/api/value/autoCompleteComment/:text', ensureAuth(), controller.autoCompleteComment);
  
  // Register internal eventSubscriptions
  eventSubscriber.saveInternalSubscriptions(eventSubscriptions);
}
