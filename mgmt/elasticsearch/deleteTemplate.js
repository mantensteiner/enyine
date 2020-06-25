var esRepo = require('./esRepository');

module.exports = function(index, done) {
	var name = 'enyine_' + index;
	
	esRepo.deleteTemplate(name, function(err) {
	    if(err) {
	      console.error(err);
	      done(Error('error processing elasticsearch deletetemplate'));
	    }
	    else {
	      done();
	    }
	  });
	  
}