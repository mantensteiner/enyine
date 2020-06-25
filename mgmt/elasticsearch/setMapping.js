var esRepo = require('./esRepository');

module.exports = function(domain, index, typeName, done) {
  var mappingPath = '../../server/domains/' + domain + '/config/mapping';

	var mappingDefinition = require(mappingPath);
    
  esRepo.putMapping(mappingDefinition, typeName, index, function(err) {
      if(err) {
        done(Error('error processing elasticsearch setmapping'));
        console.error(err);
      }
      else {
        done();
      }
    });
}

