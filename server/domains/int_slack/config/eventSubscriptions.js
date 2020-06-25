var eventNamespaces =  require('../../_shared/eventNamespaces'),
    _ = require('underscore');

module.exports = {
  subscriberKey: "enyine.internal.value",
  events: [{
      description: 'value added',
  		subscriptionType: 'internal',
		  namespace: 'value.value.create',
      domain: 'value',
      type: 'value',
      operation: 'create',
      targetMethod: 'post',
      targetUrl: '/api/slack/valueAdded',
      targetFormatter: function(target) {
        return {
          valueComment: target.snapshot.comment,
          valueId: target.snapshot.id,
          value: target.snapshot.value,
          responsible: target.snapshot.responsible,
          date: target.snapshot.value
        }
      },
      active: true
	  },{
      description: 'forward github push event',
  		subscriptionType: 'internal',
		  namespace: eventNamespaces.githubPushEvent,
      targetMethod: 'post',
      targetUrl: '/api/slack/vcsPush',
      /*targetFormatter: function(target) {
        return {
          itemId: target.snapshot.id
        }
      },*/
      active: true
	  }]
    // OR: vcs.commit.create - forward the internal vcs to decouple the direct github relation
}
