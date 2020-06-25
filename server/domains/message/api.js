var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');

exports.register = function(app) {
  app.all('/api/message/save', ensureAuth(), controller.save);
  app.all('/api/message/delete/:id', ensureAuth(), controller.del);
  app.all('/api/message/get', ensureAuth(), controller.get);
  app.all('/api/message/get/:id', ensureAuth(), controller.getById);
  app.all('/api/message/search', ensureAuth(), controller.search);
}
