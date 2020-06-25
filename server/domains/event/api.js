var ensureAuth = require('../_shared/auth/ensureAuth'),
    ensureInternal = require('../_shared/auth/ensureInternal'),
    controller = require('./controller');

module.exports.register = function(app) {
  app.all('/api/event/get', ensureAuth(), controller.get);
  app.all('/api/event/get/:id', ensureAuth(), controller.getById);
  app.all('/api/event/search', ensureAuth(), controller.search);
  app.all('/api/event/space/:id', ensureAuth(), controller.getBySpace);
}
