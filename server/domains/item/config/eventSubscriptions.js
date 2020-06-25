var eventNamespaces =  require('../../_shared/eventNamespaces'),
    _ = require('underscore');

module.exports = {
  subscriberKey: "enyine.internal.item",
  events: [{
      description: 'add item when github issue opened',
  		subscriptionType: 'internal',
		  namespace: eventNamespaces.githubIssueOpenedEvent,
      targetMethod: 'post',
      targetUrl: '/api/item/saveIssue',
      targetFormatter: function(target) {
        return target.snapshot;
      },
      active: true
	  },{
      description: 'add item when github issue changed',
  		subscriptionType: 'internal',
		  namespace: eventNamespaces.githubIssueChangedEvent,
      targetMethod: 'post',
      targetUrl: '/api/item/saveIssue',
      targetFormatter: function(target) {
        return target.snapshot;
      },
      active: true
    }]
}
