var BaseModel = require('../../_shared/baseModel'),
    log = require('../../../utils/logger'),
    q = require('q');

module.exports = function(modelConfig) {
  // init
  var model = BaseModel.create({
    index: "event",
    type: "delivery",
    disableEventLog: true, // do not log the event logging itself
    // policy: internal model, no security policies
  }, modelConfig);
  
  return model;
};