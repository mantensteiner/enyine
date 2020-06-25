var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');

exports.register = function(app) {
  app.all('/api/bookmark/save', ensureAuth(), controller.save);
  app.all('/api/bookmark/delete/:id', ensureAuth(), controller.del);
  app.all('/api/bookmark/get', ensureAuth(), controller.get);
  app.all('/api/bookmark/get/:id', ensureAuth(), controller.getById);
  app.all('/api/bookmark/search', ensureAuth(), controller.search);
}
