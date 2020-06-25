var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');

exports.register = function(app) {
  app.all('/api/valuetype/save', ensureAuth(), controller.save);
  app.all('/api/valuetype/delete/:id', ensureAuth(), controller.del);
  app.all('/api/valuetype/get', ensureAuth(), controller.get);
  app.all('/api/valuetype/get/:id', ensureAuth(), controller.getById);
  app.all('/api/valuetype/search', ensureAuth(), controller.search);
}