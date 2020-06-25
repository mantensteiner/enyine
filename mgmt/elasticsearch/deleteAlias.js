var esRepo = require('./esRepository');

module.exports = function(index, alias, done) {
	
    esRepo.deleteAlias(index, alias, function(err) {
      if(err) {
        done(Error('error processing elasticsearch deleteAlias'));
        console.error(err);
      }
      else {
        done();
      }
    });
    
}