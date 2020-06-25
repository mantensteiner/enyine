var esRepo = require('./esRepository');

module.exports = function(index, alias, done) {
	
    esRepo.deleteIndex(index)
    .then(function() {
        done();
    })
    .fail(function(err) {
        done(Error('error processing elasticsearch deleteIndex'));
        console.error(err);
    });
    
}