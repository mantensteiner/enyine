var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller'),
    apiRegistry = require('../_shared/apiRegistry');


exports.register = function(app) {
  app.all('/api/itemtype/save', ensureAuth(), controller.save);
  app.all('/api/itemtype/delete/:id', ensureAuth(), controller.del);
  app.all('/api/itemtype/get', ensureAuth(), controller.get);
  app.all('/api/itemtype/get/:id', ensureAuth(), controller.getById);
  app.all('/api/itemtype/search', ensureAuth(), controller.search);
}

  // Register to be queryable for other internal domains
  apiRegistry.register('itemtype', {
     handlers: {
       search: '/api/itemtype/search'
     }
  });