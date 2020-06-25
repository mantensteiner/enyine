var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');

exports.register = function(app) {
  app.all('/api/note/save', ensureAuth(), controller.save);
  app.all('/api/note/delete/:id', ensureAuth(), controller.del);
  app.all('/api/note/get', ensureAuth(), controller.get);
  app.all('/api/note/get/:id', ensureAuth(), controller.getById);
  app.all('/api/note/search', ensureAuth(), controller.search);
}
