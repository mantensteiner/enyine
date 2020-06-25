var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller'),
    log = require('../../utils/logger');

exports.register = function(app) {
  app.post('/api/search/', ensureAuth(), controller.searchGlobal);
}
