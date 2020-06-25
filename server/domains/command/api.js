var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');

module.exports.register = function(app) {
  app.all('/command/get', ensureAuth(), controller.get);
  app.all('/command/get/:id', ensureAuth(), controller.getById);
  app.all('/command/search', ensureAuth(), controller.search);
  app.all('/command/space/:id', ensureAuth(), controller.getBySpace);
}
