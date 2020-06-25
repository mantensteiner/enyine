var crypto = require('crypto');
    log = require('./logger'),
    q = require('q');
    
module.exports = {

  genRandomString: function(length) {
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
  },

  sha512: function(password, salt) {
    /* ToDo - use a key stretching algo, eg. pbkdf2 */
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
  },

  // generate salt 
  genSalt: function() {
    var salt = this.genRandomString(16);
    return salt;

  },
    
  // hash password
  hashPassword: function(password, salt, cb) {
    var _salt = salt || this.genSalt();

    var hash = this.sha512(password, _salt).passwordHash;

    hash += "+" + _salt;

    return q.fcall(function () { return hash; });
  },
  
  // compare password with hash
  compare: function(pass, hash, cb) {
    var defer = q.defer();

    var _hash = hash.split('+')[0]; 
    var _salt = hash.split('+')[1];

    var passHash = this.sha512(pass, _salt).passwordHash;

    if(passHash === _hash) {
      defer.resolve(true);
    } 
    else {
      defer.reject(new Error("Wrong password"));
    }

    return defer.promise;
  }
}