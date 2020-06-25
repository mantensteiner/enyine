var BaseModel = require('../../_shared/baseModel'),
    eventNamespaces = require('../../_shared/eventNamespaces'),
    idGen = require('../../../utils/idGen'),
    log = require('../../../utils/logger'),
    request = require('request'),
    q = require('q'),
    moment = require('moment'),
    crypto = require('crypto');

module.exports = function(modelConfig) {
  var model = BaseModel.create({
    index: "int_github",
    type: "repository",
    skipAuth: true,
  }, modelConfig);
  
  model.GIT_LOGO_URL = "https://help.github.com/assets/help/invertocat-fcbcdb2c581c3e42c0b4d0508849961f.png";

  // model.validateRequest
  model.validateRequest = function(headers, body) {
    var defer = q.defer();
    var self = this;
    
    var repo_full_name = body.repository.full_name;
    var queryByRepositoryName = { 
      repositoryFullName: "\"" + repo_full_name + "\""
    };
    
    model.findOne(queryByRepositoryName)
    .then(function(gitSpace) {
      model.data = gitSpace;
      if(!gitSpace) 
        throw new Error("No space found for repository " + repo_full_name);

      // Calculate hash from body payload with space hook secret
      var hmac = crypto.createHmac('sha1', gitSpace.repositorySecret);
      var hash = hmac.update(JSON.stringify(body)).digest('hex');
      if(headers["x-hub-signature"] !== ("sha1=" + hash)) {
        var err = new Error("x-hub-signature not valid");
        err.code = 401;
        throw err;
      }
      defer.resolve(gitSpace);
    })
    .fail(function(err) {
      log.error(err, {name: "githubSpace.validateRequest", headers: headers, body: body});
      defer.reject(err);
    });
    
    return defer.promise;
  }
  
  // model.executeTriggerType
  model.executeTriggerType = function(headers, body) {
    if(headers["x-github-event"] === "push") {		
      return model.push(body);
    }
    if(headers["x-github-event"] === "issues") {		
      return model.issue(body);
    }
    /*if(headers["x-github-event"] === "issue_comment") {		
      return model.issueComment(body);
    }*/
  }
  
  // model.push
  model.push = function(payload) {
    var self = this;
    var defer = q.defer();
        
    // parse message for time value on head_commit
    var iT = payload.head_commit.message.indexOf('#time:');
    var timeVal = 1;
    if(iT !== -1) {
      var tVal = payload.head_commit.message.split('#time:')[1].split(' ')[0] * 1;
      if (!isNaN(tVal)) {
        timeVal = tVal;
        // Remove time hash tag from comment
        // self.attributes.message = self.attributes.message.replace('#time:' + timeVal, '');
      }
    }
    
    // Parse token from message
    var iToken = payload.head_commit.message.indexOf('#token:');
    var tokenVal = null;
    if(iToken !== -1) {
      tokenVal = payload.head_commit.message.split('#token:')[1].split(' ')[0] + "";
      //pushData.message = pushData.message.replace('#token:' + tokenVal, '');
    }
    
    // Get unitId for repository
    
    // Simplify down to just head commit
    var eventData = {
      id: idGen(),
      spaceId: model.data.spaceId,
      ref: payload.ref,
      repositoryFullName: payload.repository.full_name,
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
      token: tokenVal,
      unitId: model.data.eventActivePushTimeUnitId
    };
    
    // Write to event store
    model.data = eventData;
    model.namespaces.push(eventNamespaces.githubPushEvent);
    model.logEvent('create', eventData.id, 'github webhook received')
    .then(function(data) {
      defer.resolve(data);
    })
    .fail(function(err) {
      defer.reject(err);
    });
    
    return defer.promise;
  }  
  
  // model.issue
  model.issue = function(body) {
    var self = this;
    var defer = q.defer();
    
    if(self.eventActiveIssue !== true) {
      defer.resolve();
      return;
    }
    
    var eventData = {
      id: idGen(),      
      issueId: body.issue.id,
      spaceId: model.data.spaceId,
      action: body.action,
      title: body.issue.title,
      description: body.issue.body,
      state: body.issue.state,
      comments: body.issue.comments,
      createdAt: body.issue.created_at,
      modifiedAt: body.issue.updated_at,
      closedAt: body.issue.closed_at,
      assignee:  body.issue.assignee,
      labels: body.issue.labels,
      user: body.issue.user.login,
      number: body.issue.number,
      htmlUrl: body.issue.html_url,
      commentsUrl: body.issue.comments_url,
      logo_url: self.GIT_LOGO_URL
    }
    
    var eventNamespace = '';
    // Create Topic on new issue
    if(eventData.action === "opened") {
      eventNamespace = eventNamespaces.githubIssueOpenedEvent;
    }
    else {
      eventNamespace = eventNamespaces.githubIssueChangedEvent;      
    }
    
    // Write to event store
    model.data = eventData;
    model.namespaces.push(eventNamespace);
    model.logEvent('create', eventData.id, 'github webhook received')
    .then(function(data) {
      defer.resolve(data);
    })
    .fail(function(err) {
      defer.reject(err);
    });
    
    return defer.promise;
  }
  
  /*model.issueComment = function(body) {
    var self = this;
    var defer = q.defer();

    var issueData = {
      action: body.action,
      title: body.issue.title,
      description: body.issue.body,
      state: body.issue.state,
      comments: body.issue.comments,
      createdAt: body.issue.created_at,
      modifiedAt: body.issue.updated_at,
      closedAt: body.issue.closed_at,
      assignee:  body.issue.assignee,
      labels: body.issue.labels,
      user: body.issue.user.login,
      issueNumber: body.issue.number,
      token: body.issue.number,
      htmlUrl: body.issue.html_url,
      commentsUrl: body.issue.comments_url,
      logo_url: GIT_LOGO_URL
    }

    var issueCommentData = {
      action: body.action,
      content: body.comment.body,
      user: body.comment.user.login,
      htmlUrl: body.comment.html_url,
      logo_url: self.GIT_LOGO_URL
    }   
    
    // Write to event store
    model.data = issueCommentData;
    model.namespaces.push(eventNamespaces.githubIssueCommentEvent);
    model.logEvent('create', eventData.id, 'github webhook received')
    .then(function() {
      defer.resolve();
    })
    .fail(function(err) {
      defer.reject(err);
    });
     
    return defer.promise;
  }*/

  return model;
};