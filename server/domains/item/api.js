var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    eventSubscriber = require('../_shared/event/eventSubscriber'),
    apiRegistry = require('../_shared/apiRegistry');

exports.register = function(app) {
  app.all('/api/item/save', ensureAuth(), controller.save);
  app.all('/api/item/delete/:spaceId/:id', ensureAuth(), controller.del);
  app.all('/api/item/get', ensureAuth(), controller.get);
  app.all('/api/item/get/:id', ensureAuth(), controller.getById);
  app.all('/api/item/search', ensureAuth(), controller.search);
  app.all('/api/item/getEventItems', ensureAuth(), controller.getEventItems);
  app.all('/api/item/submit/:id', ensureAuth(), controller.submit);
  app.all('/api/item/saveBulkData', ensureAuth(), controller.saveBulkData);
  app.all('/api/item/addRelations', ensureAuth(), controller.addRelations);
  app.all('/api/item/removeRelations', ensureAuth(), controller.removeRelations);
  app.all('/api/item/addTags', ensureAuth(), controller.addTags);
  app.all('/api/item/removeTags', ensureAuth(), controller.removeTags);
  
  app.all('/api/item/saveIssue', ensureAuth(), controller.saveIssue);
  
  // Register internal eventSubscriptions
  eventSubscriber.saveInternalSubscriptions(eventSubscriptions);
  
  // Register to be queryable for other internal domains
  apiRegistry.register('item', {
     handlers: {
       get: '/api/item/get', 
       getById: '/api/item/getById/:id', 
       search: '/api/item/search'
     }
  });
}
