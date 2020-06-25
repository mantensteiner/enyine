/*var //slack = require('../../utils/slackIntegration');

exports.receive = function(req,res) {
  
  
  // bbetter: 
  // possible malicious request: validate header with matching Space
  // for all possible events (issue,issue comment, push...) check if available and extract the content
  // for each event the payload is posted to the event store
  // the interested services (eg Item+slack) check the payload and their integration settings (spaceid+settings)
  
  
  
  // the subscribed space service has an endpoint for resolving & validating the data for a space
  // the space service posts the space with the event-id where the payload is stored,
  // all other interested services (space)
  

  var GIT_LOGO_URL = "https://help.github.com/assets/help/invertocat-fcbcdb2c581c3e42c0b4d0508849961f.png";

  if(!req.headers["x-hub-signature"]) {
    res.json("x-hub-signature header which is mandatory not provided", 400);
    return;
  }

  var repo_full_name = req.body.repository.full_name;

  // Get space from repo full_name
  var querySpace = {githubRepoName:"\"" + repo_full_name + "\""};

  var space = new Space();
  space.findOne(querySpace)
    .then(function(_space) {
      if(!_space) {
        res.json("An error occured", 500);
      }

      // Calculate hash from body payload with space hook secret
      var hmac = crypto.createHmac('sha1', _space.githubRepoSecret);
      var hash = hmac.update(JSON.stringify(req.body)).digest('hex');
      if(req.headers["x-hub-signature"] !== ("sha1=" + hash)) {
        res.json("x-hub-signature not valid", 401);
        return;
      }

      //
      // Issue
      if(req.headers["x-github-event"] === "issues" && _space.githubEventActiveIssue === true) {
        var issueData = {
          action: req.body.action,
          title: req.body.issue.title,
          description: req.body.issue.body,
          state: req.body.issue.state,
          comments: req.body.issue.comments,
          createdAt: req.body.issue.created_at,
          modifiedAt: req.body.issue.updated_at,
          closedAt: req.body.issue.closed_at,
          assignee:  req.body.issue.assignee,
          labels: req.body.issue.labels,
          user: req.body.issue.user.login,
          id: req.body.issue.id,
          number: req.body.issue.number,
          htmlUrl: req.body.issue.html_url,
          commentsUrl: req.body.issue.comments_url,
          logo_url: GIT_LOGO_URL
        }

        // Create Item on new issue
        if(issueData.action === "opened") {
          var item = new Item();
          item.create({
            name: issueData.title,
            spaceId: _space.id,
            issueId: issueData.id,
            issueNumber: issueData.number,
            token: issueData.number + "",
            comment: "From Github issue " + issueData.number + " created by " +
              issueData.user + ". Link: " + issueData.htmlUrl
          }).then(function(){
              if(_space.slackWebHookUrl && _space.slackPostGitIssue === true) {
                slack.gitIssue(_space.slackWebHookUrl, issueData, res);
              }
            },function(err) {
              console.log(err); res.json("internal server error", 500);
            });
        }
        else {
          // Report issue changes to slack
          if(_space.slackWebHookUrl && _space.slackPostGitIssue === true) {
            slack.gitIssue(_space.slackWebHookUrl, issueData, res);
          }
        }
      }

      //
      // Issue comment
      else if(req.headers["x-github-event"] === "issue_comment" && _space.githubEventActiveIssueComment === true) {
        var issueData = {
          action: req.body.action,
          title: req.body.issue.title,
          description: req.body.issue.body,
          state: req.body.issue.state,
          comments: req.body.issue.comments,
          createdAt: req.body.issue.created_at,
          modifiedAt: req.body.issue.updated_at,
          closedAt: req.body.issue.closed_at,
          assignee:  req.body.issue.assignee,
          labels: req.body.issue.labels,
          user: req.body.issue.user.login,
          issueNumber: req.body.issue.number,
          token: req.body.issue.number,
          htmlUrl: req.body.issue.html_url,
          commentsUrl: req.body.issue.comments_url,
          logo_url: GIT_LOGO_URL
        }

        var issueCommentData = {
          action: req.body.action,
          content: req.body.comment.body,
          user: req.body.comment.user.login,
          htmlUrl: req.body.comment.html_url,
          logo_url: GIT_LOGO_URL
        }

        // Report issue comment to slack
        if(_space.slackWebHookUrl && _space.slackPostGitIssueComment === true) {
          slack.gitIssueComment(_space.slackWebHookUrl, issueData, issueCommentData, res);
        }
      }

      //
      // Push
      else if(req.headers["x-github-event"] === "push" && _space.githubEventActivePush === true) {
        var pushData = {
          ref: req.body.ref,
          repo: req.body.repository.name,
          pusher: req.body.pusher.name,
          commit_count: req.body.commits.length,
          message: req.body.head_commit.message,
          author: req.body.head_commit.author.name,
          timestamp: req.body.head_commit.timestamp,
          url: req.body.head_commit.url,
          logo_url: GIT_LOGO_URL
        };

        function saveCommit(c) {
          var commit = new Commit();
          commit.create(c).then(function(){},function(err) {
            console.log(err);
            res.json("internal server error", 500);
          });
        }

        _.each(req.body.commits, function(commit) {
          commit.id = null;
          commit.spaceId = _space.id;
          commit.pusher = pushData.pusher;
          commit.ref = pushData.ref;
          saveCommit(commit);
        });

        if(_space.slackWebHookUrl && _space.slackPostGitPush === true)
          slack.gitPush(_space.slackWebHookUrl, pushData, res);
        else
          res.json({});
      }
    },
    function(err) {
      res.json(err, 500);
    });
}
*/