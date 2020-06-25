var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');

exports.register = function(app) {
  app.all('/api/tag/save', ensureAuth(), controller.save);
  app.all('/api/tag/delete', ensureAuth(), controller.del);
  app.all('/api/tag/get', ensureAuth(), controller.get);
  app.all('/api/tag/get/:id', ensureAuth(), controller.getById);
  app.all('/api/tag/search', ensureAuth(), controller.search);
}
