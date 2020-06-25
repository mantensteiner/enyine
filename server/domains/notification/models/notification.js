var BaseModel = require('../../_shared/baseModel'),
    spacePolicies = require('../../_shared/spacePolicies');

module.exports = function(modelConfig) {
  // init 
  var model = BaseModel.create({
    index: "notification",
    type: "notification",
    policy: spacePolicies.spaceMemberPolicy,
    disableEventLog: true,
    sortField: "timestamp",
    sortDir: "desc"
  }, modelConfig);

  return model;
};