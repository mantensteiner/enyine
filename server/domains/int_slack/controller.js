var slack_github = require('./models/slack_github'),
	slack_enyine = require('./models/slack_enyine');

/**
 * 	vcsPush
 */
exports.vcsPush = function(req, res){
	var sgh = new slack_github(req.user);
	sgh.push(req.body.push).then(function(result) {
		res.json(result);
	}, function(err) {
		res.json({message:err.message}, err.code ? err.code*1 : 500);
	});    	
}

/**
 * 	valueAdded
 */
exports.valueAdded = function(req, res){
	var sgh = new slack_enyine(req.user);
	sgh.newValue(req.body.value).then(function(result) {
		res.json(result);
	}, function(err) {
		res.json({message:err.message}, err.code ? err.code*1 : 500);
	});    	
}
/*
exports.gitIssue = function(req, res){
	var sgh = new slack_github(req.user);
	sgh.issue(req.body.issue).then(function(result) {
		res.json(result);
	}, function(err) {
		res.json({message:err.message}, err.code ? err.code*1 : 500);
	});    	
}

exports.gitIssueComment = function(req, res){
	var sgh = new slack_github(req.user);
	sgh.issueComment(req.body.issue, req.body.issueComment).then(function(result) {
		res.json(result);
	}, function(err) {
		res.json({message:err.message}, err.code ? err.code*1 : 500);
	});    	
}
*/

