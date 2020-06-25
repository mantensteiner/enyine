var repo = require('./esRepo'),
    Q = require('q');

module.exports = {

  // Generate the next increment (+1) in a sequence for a given key  
  next: function(key) {
    var defer = Q.defer();
    
    repo().nextNumber(key)
    .then(function(nr) {
      return defer.resolve(nr);
    }, function(err){
      return defer.reject(err);
    });
    
    return defer.promise;
  }
  
};