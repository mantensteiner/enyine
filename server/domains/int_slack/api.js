var ensureAuth = require('../_shared/auth/ensureAuth'),
    controller = require('./controller');

exports.register = function(app) {
  app.post('/api/slack/vcsPush', controller.vcsPush);
  // app.post('/api/slack/gitIssue', controller.gitIssue);
  // app.post('/api/slack/gitIssueComment', controller.gitIssueComment);
  app.post('/api/slack/valueAdded', controller.valueAdded);
}
