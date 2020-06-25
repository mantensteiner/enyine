// Authentication error
function AuthenticationError(message) {
  this.name = 'Authentication';
  this.message = message || 'Not authenticated';
}
AuthenticationError.prototype = Object.create(Error.prototype);
AuthenticationError.prototype.constructor = AuthenticationError;

// Authorization error
function AuthorizationError(message) {
  this.name = 'AuthorizationError';
  this.message = message || 'Operation denied after checking security policies';
}
AuthorizationError.prototype = Object.create(Error.prototype);
AuthorizationError.prototype.constructor = AuthorizationError;

// General data validation error
function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message || 'Error validating object data';
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

// ElasticsearchRepoError error
function ElasticsearchRepoError(message) {
  this.name = 'ElasticsearchRepoError';
  this.message = message || 'ElasticsearchRepoError';
}
ElasticsearchRepoError.prototype = Object.create(Error.prototype);
ElasticsearchRepoError.prototype.constructor = ElasticsearchRepoError;

// Redis cache error
function RedisCacheError(message) {
  this.name = 'RedisCacheError';
  this.message = message || 'RedisCacheError';
}
RedisCacheError.prototype = Object.create(Error.prototype);
RedisCacheError.prototype.constructor = RedisCacheError;


// Network request cache error
function NetworkRequestError(message) {
  this.name = 'NetworkRequestError';
  this.message = message || 'NetworkRequestError';
}
NetworkRequestError.prototype = Object.create(Error.prototype);
NetworkRequestError.prototype.constructor = NetworkRequestError;

// exports
module.exports = {
  NetworkRequestError: NetworkRequestError,
	AuthenticationError: AuthenticationError,
	AuthorizationError: AuthorizationError,
	ElasticsearchRepoError: ElasticsearchRepoError,
	ValidationError: ValidationError,
  RedisCacheError: RedisCacheError
}