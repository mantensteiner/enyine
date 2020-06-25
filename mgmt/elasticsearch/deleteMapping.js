var esRepo = require('./esRepository');

module.exports = function(index, typeName, done) {
    
    esRepo.deleteMapping(index, typeName, function(err) {
        if(err) {
          done(Error('error processing elasticsearch deleteMapping'));
          console.error(err);
        }
        else {
          done();
        }
      });
      
}