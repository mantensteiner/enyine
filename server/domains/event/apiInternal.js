var ensureAuth = require('../_shared/auth/ensureAuth'),
    ensureInternal = require('../_shared/auth/ensureInternal'),
    controller = require('./controller');

module.exports.register = function(app) {
  app.all('/event/write', ensureAuth(), controller.write);
  app.all('/event/callInternalSubscribers', ensureAuth(), controller.callInternalSubscribers);
  app.all('/event/subscribe', ensureAuth(), controller.subscribe);
  //app.all('/event/updateSubscription', ensureAuth(), controller.updateSubscription);
  app.all('/event/updateInternalSubscriptions', ensureInternal(), controller.saveSubscriptions);
}
