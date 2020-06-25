var ensureInternal = require('../_shared/auth/ensureInternal'),
    controller = require('./controller');

module.exports.register = function(app) {
  app.all('/api/quantity/import', ensureInternal(), controller.import);
  app.all('/api/quantity/delete/:id', ensureInternal(), controller.del);
}
