var BaseModel = require('../../_shared/baseModel');

module.exports = function(modelConfig) {
  // init 
  var model = BaseModel.create({
    index: "user",
    type: "avatar"
  }, modelConfig);
  
  return model;
};