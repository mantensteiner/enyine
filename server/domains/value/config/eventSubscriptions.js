var eventNamespaces =  require('../../_shared/eventNamespaces'),
    _ = require('underscore');

module.exports = {
  subscriberKey: "enyine.internal.value",
  events: [{
      description: 'remove item from values after item deleted',
  		subscriptionType: 'internal',
		  namespace: 'item.item.delete',
      domain: 'item',
      type: 'item',
      operation: 'delete',
      targetMethod: 'post',
      targetUrl: '/api/value/removeItem',
      targetFormatter: function(target) {
        return {
          itemId: target.snapshot.id,
          spaceId: target.snapshot.spaceId
        }
      },
      active: true
      // skipAuth:false (not necessary, default behaviour)
	  },{
      description: 'add value after commit with message, time',
  		subscriptionType: 'internal',
		  namespace: eventNamespaces.githubPushEvent,
      targetMethod: 'post',
      targetUrl: '/api/value/save',
      targetFormatter: function(target) {        
        return {
          spaceId: target.snapshot.repository.spaceId,
          unit: { id: target.snapshot.repository.unitId },
          commitId: target.snapshot.repository.id,
          value: target.snapshot.repository.value,
          token: target.snapshot.repository.token,
          comment: target.snapshot.repository.message,
          date: target.snapshot.repository.date,
          committer: target.snapshot.repository.committer
        };
      },
      active: true,
      skipAuth: true // anonymous request from github hook
	  }]
}
