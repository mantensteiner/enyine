var esRepo = require('./esRepository');


module.exports = function(indexName, done) {
	var mappingPath = '../../server/domains/' + indexName + '/config/mapping';
	console.log("mapping path for domain " + indexName + ": " + mappingPath);
	var mappingDefinition = require(mappingPath);
	
	esRepo.setTemplate(mappingDefinition, indexName, function(err) {
	    if(err) {
	      done(Error('error processing elasticsearch settemplate'));
	      console.error(err);
	    }
		else {
		  if(done) 
			done();
	    }
	  });
}