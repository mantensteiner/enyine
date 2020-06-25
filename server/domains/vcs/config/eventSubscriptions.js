var eventNamespaces =  require('../../_shared/eventNamespaces'),
    _ = require('underscore');

module.exports = {
  subscriberKey: "enyine.internal.vcs",
  events: [{
      description: 'add commit from github',
  		subscriptionType: 'internal',
		  namespace: eventNamespaces.githubPushEvent,
      targetMethod: 'post',
      targetUrl: '/api/vcs/commit',
      targetFormatter: function(target) {
        
        // should fit naturally
        
        /*var eventData = {
          id: idGen(),
          spaceId: model.data.spaceId,
          ref: payload.ref,
          repositoryFullName: payload.repository.name,
          pusher: payload.pusher,
          author: payload.head_commit.author,
          committer: payload.head_commit.committer,
          commit_count: payload.commits.length,
          message: payload.head_commit.message,
          date: moment(payload.head_commit.timestamp),
          url: payload.head_commit.url,
          logo_url: self.GIT_LOGO_URL,
          added: payload.head_commit.added,
          removed: payload.head_commit.removed,
          modified: payload.head_commit.modified,
          value: timeVal,
          token: tokenVal
        };*/
        
        target.snapshot.source = 'github';
        return target;
      },
      active: true
	  }]
}
