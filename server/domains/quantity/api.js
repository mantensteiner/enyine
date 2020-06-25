var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');

exports.register = function(app) {
  app.all('/api/quantity/get', ensureAuth(), controller.get);
  app.all('/api/quantity/get/:id', ensureAuth(), controller.getById);
  app.all('/api/quantity/search', ensureAuth(), controller.search);
}
