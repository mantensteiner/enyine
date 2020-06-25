var controller = require('./controller'),
    ensureAuth = require('../_shared/auth/ensureAuth'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    eventSubscriber = require('../_shared/event/eventSubscriber');


exports.register = function(app) {
  app.all('/api/space/create', ensureAuth(), controller.create);
  app.all('/api/space/save', ensureAuth(), controller.save);
  app.all('/api/space/get', ensureAuth(), controller.get);
  app.all('/api/space/get/:id', ensureAuth(), controller.getById);
  app.all('/api/space/delete/:id', ensureAuth(), controller.del);
  
  app.all('/api/space/addUser', ensureAuth(), controller.saveUser);
  app.all('/api/space/removeUser', ensureAuth(), controller.removeUser);
    
  app.all('/api/space/getStatus/:id', ensureAuth(), controller.getStatus);
  app.all('/api/space/saveStatus', ensureAuth(), controller.saveStatus);
  app.all('/api/space/deleteStatus', ensureAuth(), controller.deleteStatus);

  app.all('/api/space/getPriorities/:id', ensureAuth(), controller.getPriorities);
  app.all('/api/space/savePriority', ensureAuth(), controller.savePriority);
  app.all('/api/space/deletePriority', ensureAuth(), controller.deletePriority);
  
  app.all('/api/space/getUnits/:id', ensureAuth(), controller.getUnits);  
  app.all('/api/space/saveUnit', ensureAuth(), controller.saveUnit);
  app.all('/api/space/deleteUnit', ensureAuth(), controller.deleteUnit);
  
  // Register internal eventSubscriptions
  eventSubscriber.saveInternalSubscriptions(eventSubscriptions);
}
