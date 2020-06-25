var BaseModel = require('../../_shared/baseModel'),
    spacePolicies = require('../../_shared/spacePolicies'),
    log = require('../../../utils/logger'),
    typeHelper = require('../../../utils/typeHelper'),
    ValidationError = require('../../../utils/errors').ValidationError,
    q = require('q'),
    _ = require('underscore');

module.exports = function(modelConfig) {
  // init
  var model = BaseModel.create({
    index: "command",
    type: "command",
    disableEventLog: true, 
    //policy: spacePolicies.spaceMemberPolicy,
    skipAuth: true,
    sortField: "timestamp",
    sortDir: "desc"
  }, modelConfig);
  
  return model;
};