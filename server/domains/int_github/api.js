var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');

exports.register = function(app) {
  app.all('/api/github/receive', controller.receive);
  
  app.all('/api/github/save', ensureAuth(), controller.save);
  app.all('/api/github/delete/:id', ensureAuth(), controller.del);
  app.all('/api/github/get', ensureAuth(), controller.get);
  app.all('/api/github/get/:id', ensureAuth(), controller.getById);
  app.all('/api/github/search', ensureAuth(), controller.search);
}
