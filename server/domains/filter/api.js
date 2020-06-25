var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');


exports.register = function(app) {
  app.all('/api/filter/save', ensureAuth(), controller.save);
  app.all('/api/filter/delete/:id', ensureAuth(), controller.del);
  app.all('/api/filter/get', ensureAuth(), controller.get);
  app.all('/api/filter/get/:id', ensureAuth(), controller.getById);
  app.all('/api/filter/search', ensureAuth(), controller.search);
}
