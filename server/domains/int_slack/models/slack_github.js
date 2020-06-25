var BaseModel = require('../../_shared/baseModel'),
    q = require('q'),
    moment = require('moment'),
    request = require('request');

module.exports = function(modelConfig) {  
  // init 
  var model = BaseModel.create({
    index: "int_slack",
    type: "github",
    sortField: "modifiedOn",
    sortDir: "desc"
  }, modelConfig);


  model.beforeCreate = function(cb) {
    this.attributes.createdOn = new Date();
    this.attributes.modifiedOn = new Date();
    if(this.user)
      this.attributes.createdBy = this.user.username;
    if(this.user)
      this.attributes.modifiedBy = this.user.username;

    cb(null);
  };

  model.beforeSave = function(cb, user) {
    this.attributes.modifiedOn = new Date();
    if(this.user)
      this.attributes.modifiedBy = this.user.username;

    cb(null);
  };
  
  model.push = function(push) {
    var defer = q.defer();
    
    // Load hook url 
    // DEBUG
    var hookUrl = 'https://appspark.slack.com/services/hooks/incoming-webhook?token=htxjUq82SzaW7C0XAjR1qE16';
    
    var msg =  push.pusher + " pushed " + push.commit_count + " commit(s) to " + push.repo +
      ". Head-Commit: '" + push.message + "' by " + push.author + " on " +
      moment(push.timestamp).format("YYYY-MM-DD HH:MM") + " (" + push.url + ")";

    var body = { json: {text: msg, "icon_url": push.logo_url } };
    request.post(
      hookUrl,
      body,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          defer.resolve({});
        }
        else {
          defer.reject(error, response.statusCode);
        }
      }
    );
    
    return defer.promise;    
  }
  
  model.issue = function(issue) {
    var defer = q.defer();
    
    // Load hook url 
    // DEBUG
    var hookUrl = 'https://appspark.slack.com/services/hooks/incoming-webhook?token=htxjUq82SzaW7C0XAjR1qE16';
    
    var msg =  "Issue with number " + issue.number + " and title " + issue.title +
      " was " + issue.action + " by user " + issue.user + ". Current Issue state is " + issue.state + "."  +
      "\n<" + issue.htmlUrl + "|Click here> for details.";

    var body = { json: {text: msg, "icon_url": issue.logo_url } };
    request.post(
      hookUrl,
      body,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          defer.resolve({});
        }
        else {
          defer.reject(error, response.statusCode);
        }
      }
    );
    
    return defer.promise;    
  }  
  
  model.issueComment = function(issue, issueComment) {
    var defer = q.defer();
    
    // Load hook url 
    // DEBUG
    var hookUrl = 'https://appspark.slack.com/services/hooks/incoming-webhook?token=htxjUq82SzaW7C0XAjR1qE16';
    
    var msg =  "A comment starting with '" + issueComment.content.substring(0,20) + "...' for the issue " + issue.number + "  with title " + issue.title +
      " was " + issueComment.action + " by user " + issueComment.user + ". Current Issue state is " + issue.state + "."  +
      "\n<" + issueComment.htmlUrl + "|Click here> for details.";

    var body = { json: {text: msg, "icon_url": issue.logo_url } };
    request.post(
      hookUrl,
      body,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          defer.resolve({});
        }
        else {
          defer.reject(error, response.statusCode);
        }
      }
    );
    
    return defer.promise;    
  }  

  return model;
};