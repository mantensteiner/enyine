
module.exports = {
  subscriberKey: "enyine.internal.auth",
  events: [{
      description: 'update email in account if changed on user',
  		subscriptionType: 'internal',
		  namespace: 'user.user.update',
      domain: 'user',
      type: 'user',
      operation: 'update',
      fieldChanges: ['email'],
      targetMethod: 'post',
      targetUrl: '/api/auth/updateAccount',
      targetFormatter: function(target) {
        return {
          email: target.snapshot.email
        };
      },
      active: true
	  }]
}
