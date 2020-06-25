var BaseModel = require('../../_shared/baseModel'),
    spacePolicies = require('../../_shared/spacePolicies'),
    log = require('../../../utils/logger'),
    typeHelper = require('../../../utils/typeHelper'),
    ValidationError = require('../../../utils/errors').ValidationError,
    Snapshot = require('./snapshot'),
    Subscriber = require('./subscriber'),
    q = require('q'),
    _ = require('underscore');

module.exports = function(modelConfig) {
  // init
  var model = BaseModel.create({
    index: "event",
    type: "event",
    disableEventLog: true, // do not log the event logging itself
    // event-payloads always have to provide a spaceId
    // a user can only post events to membership-spaces
    policy: spacePolicies.spaceMemberPolicy,
    sortField: "timestamp",
    sortDir: "desc"
  }, modelConfig);
  
  return model;
};