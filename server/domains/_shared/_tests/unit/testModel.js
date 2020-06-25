var BaseModel = require('../../baseModel'),
    ValidationError = require('../../../../utils/errors').ValidationError,
    q = require('q');

var TestModel = function(modelConfig) {
  var model = BaseModel.create({
    index: "test",
    type: "test",
  }, modelConfig);
  model.data.timestamp = Date.now();

  model.validate = function(data) {
    if(!TestModel.namespace) 
      return q.fcall(function () { throw new ValidationError('Namespace missing.'); });
    if(!TestModel.targetUrl) 
      return q.fcall(function () { throw new ValidationError('TargetUrl missing.'); });
    return q.fcall(function () { return data; });
  }
    
  // overwrite
  model.create = function() {
    return q.fcall(function () { return model.data; });
  }
  
  model.testPromises = function() {
    var i = 3;
    var defer = q.defer();
    doDelay()
    .then(function() {
      var otherDefer = q.defer();
      for(var j = i; j > 0; j--) {
        doDelay().then(function() {
          if(i == 0)
            return otherDefer.resolve(i);
        })
      }
      return otherDefer.promise;
    })
    .then(function(result) {
      return defer.resolve(result);
    });
    
    function doDelay() {
      var deferInner = q.defer();
      i--;
      setTimeout(function() {
        // uncomment to test exception bubbling to the end of the chain
        //if(i == 2)
        //  throw new Error('failed at 2nd promise');
        deferInner.resolve(i);
      }, 100);
      
      return deferInner.promise;
    }
    return defer.promise;
  }
    
  return model;
};

module.exports = TestModel;