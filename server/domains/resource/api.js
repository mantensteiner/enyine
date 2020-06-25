var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');

exports.register = function(app) {
  app.all('/api/resource/save', ensureAuth(), controller.save);
  app.all('/api/resource/delete/:id', ensureAuth(), controller.del);
  app.all('/api/resource/get', ensureAuth(), controller.get);
  app.all('/api/resource/get/:id', ensureAuth(), controller.getById);
  app.all('/api/resource/search', ensureAuth(), controller.search);
}
