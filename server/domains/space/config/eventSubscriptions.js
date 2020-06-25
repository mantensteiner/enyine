var eventNamespaces =  require('../../_shared/eventNamespaces'),
    _ = require('underscore');


var sourceFormatter = function(source) {
  // reduce snapshot to spaceInvitations
  return {
    userId: source.snapshot.id,
    username: source.snapshot.username,
    admin: source.snapshot.admin,
    spaceInvitations: source.snapshot.spaceInvitations
  }
};

module.exports = {
  subscriberKey: "enyine.internal.space",
  events: [{
      description: 'add a user to a space',
      subscriptionType: 'internal',
		  namespace: eventNamespaces.userJoinedSpace, 
      targetMethod: 'post',
      targetUrl: '/api/space/saveUser',
      // reduce payload and shape the data for this handler
      // all stored in db - eval in eventHandler... may be a bad idea but worth a try
      // eval-performance is maybe not a big problem, eval'd functions can be cached in V8
      sourceFormatter: String(sourceFormatter),
      active: true
	  }]
}
