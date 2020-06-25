/*var bcrypt = require('bcrypt'),
    log = require('./logger'),
    q = require('q');
    
var crypto = {

  // generate salt
  genSalt: function(cb) {
    var defer = q.defer();
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
		    log.error(err, {name: 'cryptoService.genSalt.bcrypt.genSalt'});
        if(cb) 
          return cb(err);
        else 
          return defer.reject(err);
      } else {
        if(cb)
          return cb(null, salt);
        else
          return defer.resolve(salt);
      }
    });
    return defer.promise;
  },
    
  // hash password
  hashPassword: function(password, salt, cb) {
    var defer = q.defer();
    if(!salt) {
      bcrypt.genSalt(10, function(err, _salt) {
        genHash(_salt);
      });
    }
    else {
      genHash(salt);
    }
    
    function genHash(_salt) {
      bcrypt.hash(password, _salt, function(err, hash) {
        if (err) {
			    log.error(err, {name: 'cryptoService.genSalt.bcrypt.hash'});
          if(cb) 
            return cb(err);
          else 
            return defer.reject(err);
        } else {
          if(cb)
            return cb(null, hash);
          else
            return defer.resolve(hash);
        }
      });
    }
    
    return defer.promise;
  },
  
  // compare password with hash
  compare: function(pass, hash, cb) {
    var defer = q.defer();
    
    bcrypt.compare(pass, hash, function(err, areEqual) {
      if (err) {
  			log.error(err, {name: 'cryptoService.compare'}); 
        if(cb)
          return cb(err);
        else 
          return defer.reject(err);
      } else {
        if(cb)
          return cb(null, areEqual);
        else
          return defer.resolve(areEqual);
      }
    });
    return defer.promise;
  }
}

module.exports = crypto;
*/