var q = require('q'),
	log = require('./logger'),
    config = require('../config')(),
    sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.sendgrid.apiKey);

module.exports.sendResetLink = function(options) {
	var defer = q.defer();
	var url = config.web.baseUrl + "/#/activate/" + options.token + "?reset";
	
	var mailOptions = {
	    to:       options.email,
	    from:     'support@timeutil.com',
	    subject:  'Reset your password for \'enyine\'',
	    text:     'Please click your confirmation link: ' + url,
	    html:     'Please click your confirmation link: <a href="' + url + '">Password reset</a>'
	};

	sgMail.send(mailOptions, function(err, info){
	    if (err) { 
				log.error(err, {name: 'sendResetLink.sendMail', options: options}); 
				return defer.reject(err); 
	    } else {
		 		log.debug('Message sent: ' + info.response); 
				defer.resolve(options);
	    }
	}); 
 
	return defer.promise;
};

module.exports.sendActivationLink = function(options) {
	var defer = q.defer();
	var url = config.web.baseUrl + "/#/activate/" + options.token;
	
	var mailOptions = {
	    to:       options.email,
	    from:     'support@timeutil.com',
	    subject:  'Activate your account for \'enyine\'',
	    text:     'Please click your confirmation link: ' + url,
	    html:     'Please click your confirmation link: <a href="' + url + '">Activate account</a>'
	};
	
	sgMail.send(mailOptions, function(err, info){
	    if (err) { 
				log.error(err, {name: 'sendActivationLink.sendMail', options: options}); 
				return defer.reject(err); 
	    } else {
		 		log.debug('Message sent: ' + info.response); 
				defer.resolve(options);
	    }
	}); 
 
	return defer.promise;  
};


module.exports.sendSignupConfirmation = function(options) {
	var defer = q.defer();
  
	var mailOptions = {
	    to:       options.email,
	    from:     'hello@timeutil.com',
	    subject:  'Hello ' + options.name + ', welcome to \'enyine\' :-)',
	    text:     'Your registration was successful! Quite cool ' + options.name + '!',
	    html:     'Your registration was successful! Quite cool ' + options.name + '!'
	};
	
	sgMail.send(mailOptions, function(err, info){
	    if (err) { 
				log.error(err, {name: 'sendSignupConfirmation.sendMail', options: options}); 
				return defer.reject(err); 
	    } else {
		 		log.debug('Message sent: ' + info.response); 
				defer.resolve(options);
	    }
	}); 
 
	return defer.promise;  
};

module.exports.sendResetConfirmation = function(options) {
	var defer = q.defer();
  
	var mailOptions = {
	    to:       options.email,
	    from:     'hello@timeutil.com',
	    subject:  'Password change for ' + options.name + ', to \'enyine\'',
	    text:     'Your password just got changed. You can login now :-)',
	    html:     'Your password just got changed. You can login now :-)'
	};
	
	sgMail.send(mailOptions, function(err, info){
	    if (err) { 
				log.error(err, {name: 'sendResetConfirmation.sendMail', options: options}); 
				return defer.reject(err); 
	    } else {
		 		log.debug('Message sent: ' + info.response); 
				defer.resolve(options);
	    }
	}); 
 
	return defer.promise;  
};

module.exports.sendSpaceInvite = function(options) {
	var defer = q.defer();
	var url = config.web.baseUrl + "/#/space/join/" + options.token + "/" + options.spaceName;
	
	var mailOptions = {
	    to:       options.email,
	    from:     'support@timeutil.com',
	    subject:  'Enyine invitation from ' + options.invitationFrom,
	    text:     'Hello ' + options.name + ', to join the space ' + options.spaceName + ' (or dismiss the invitation) click your confirmation link: ' + url,
	    html:     'Hello ' + options.name + ', to join the space <b>' + options.spaceName + '</b> (or dismiss the invitation) click your confirmation link: <a href="' + url + '">Space Invitation</a>'
	};
	
	sgMail.send(mailOptions, function(err, info){
	    if (err) { 
				log.error(err, {name: 'sendSpaceInvite.sendMail', options: options}); 
				return defer.reject(err); 
	    } else {
			 	log.debug('Message sent: ' + info.response); 
				return defer.resolve(options);
	    }
	}); 
 
	return defer.promise;
};

module.exports.sendSpaceInviteConfirm = function(options) {
	var defer = q.defer();
	  
	var mailOptions = {
	    to:       options.email,
	    from:     'support@timeutil.com',
	    subject:  'enyine confirmation, you joined the Space \'' + options.spaceName + '\'!',
	    text:     'Good news ' + options.name + ', you successfully joined the Space ' + options.spaceName + '. The team gives you a warm welcome :-)',
	    html:     'Good news ' + options.name + ', you successfully joined the Space <b>' + options.spaceName + '</b>. The team gives you a warm welcome :-)'
	};
	
	sgMail.send(mailOptions, function(err, info){
	    if (err) { 
				log.error(err, {name: 'sendSpaceInviteConfirm.sendMail', options: options});
				return defer.reject(err);
	    } else {
		 	log.debug('Message sent: ' + info.response); 
			defer.resolve(options);
	    }
	}); 
 
	return defer.promise;
};

module.exports.sendSpaceInviteDismiss = function(options) {
	var defer = q.defer();
	  
	var mailOptions = {
	    to:       options.email,
	    from:     'support@timeutil.com',
	    subject:  'enyine quick note, you dismissed you invitation for the Space \'' + options.spaceName + '\'!',
	    text:     'In a quick note we want to confirm, ' + options.name + ', that you dismissed your invitation for the Space ' + options.spaceName + '. Maybe next time.',
	    html:     'In a quick note we want to confirm, ' + options.name + ', that you dismissed your invitation for the Space <b>' + options.spaceName + '</b>. Maybe next time.',
	};
	
	sgMail.send(mailOptions, function(err, info){
	    if (err) { 
				log.error(err, {name: 'sendSpaceInviteDismiss.sendMail', options: options});
				return defer.reject(err); 
	    } else {
		 		log.debug('Message sent: ' + info.response); 			
				defer.resolve(options);
	    }
	}); 
 
	return defer.promise;  
};



