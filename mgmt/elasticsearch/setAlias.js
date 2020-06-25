var esRepo = require('./esRepository');

module.exports = function(index, alias, done) {
	
    esRepo.setAlias(index, alias, function(err) {
      if(err) {
        done('error processing elasticsearch setalias');
        console.error(err);
      }
      else {
        done();
      }
    });
}