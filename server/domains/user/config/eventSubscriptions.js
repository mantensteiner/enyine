var eventNamespaces =  require('../../_shared/eventNamespaces'),
    _ = require('underscore');

module.exports = {
  subscriberKey: "enyine.internal.user",
  events: [{
      description: 'create a new user after account activation',
  		subscriptionType: 'internal',
      namespace: eventNamespaces.accountActivated,
      // type: 'account',
      // fieldChanges: ['email'] - only fire if the given fields are changed
      targetMethod: 'post',
      targetUrl: '/api/user/createFromAccount',
      targetFormatter: function(target) {
        return {
          id: target.snapshot.userId,
          username: target.snapshot.username,
          email: target.snapshot.email
        }
      },
      active: true
	  },{
      description: 'new space created, update the space memberships for a user',
      subscriptionType: 'internal',
		  namespace: eventNamespaces.spaceCreated,
      targetMethod: 'post',
      targetUrl: '/api/user/saveSpaceMembers',
      targetFormatter: function(target) {
        return {
          spaceId: target.snapshot.id,
          spaceName: target.snapshot.name,
          userIds: _.map(target.snapshot.users, function(u) { return u.id; })
        }
      },
      active: true
	  },{
      description: 'remove the space membership for all users',
      subscriptionType: 'internal',
		  namespace: 'space.space.delete',
      domain: 'space',
      type: 'space',
      operation: 'delete',
      targetMethod: 'post',
      targetUrl: '/api/user/removeSpaceFromMembers',
      targetFormatter: function(target) {
        return {
          spaceId: target.snapshot.id
        }
      },
      active: true
	  },{
      description: 'update the space memberships for users',
      subscriptionType: 'internal',
		  namespace: 'space.space.update',
      fieldChanges: ['users','name'], // only fire if the users or the name of a space have changed   
      domain: 'space',
      type: 'space',
      operation: 'update',
      targetMethod: 'post',
      targetUrl: '/api/user/saveSpaceMembers',
      targetFormatter: function(target) {
        return {
          spaceId: target.snapshot.id,
          spaceName: target.snapshot.name,
          userIds: _.map(target.snapshot.users, function(u) { return u.id; }),
        }
      },
      active: true
	  }]
}
