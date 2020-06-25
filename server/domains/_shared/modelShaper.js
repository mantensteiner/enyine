var _ = require('underscore');

/**
 *  Simple reduce against top level keys
 *  definition: object with the allowed keys
 *  data: the object to validate
 */
module.exports = function (config) {
  var allowedFields = _.keys(config.definition);
  var result = {};
  _.each(allowedFields, function(f) {
    if(config.data[f] !== undefined)
      result[f] = config.data[f];
  });
  return result;
}