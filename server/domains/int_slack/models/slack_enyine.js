var BaseModel = require('../../_shared/baseModel'),
    request = require('request'),
    q = require('q');

module.exports = function(modelConfig) {
  // init 
  var model = BaseModel.create({
    index: "int_slack",
    type: "enyine",
    id: modelConfig.spaceId,
    sortField: "modifiedOn",
    sortDir: "desc"
  }, modelConfig);
  

  model.beforeCreate = function(cb) {
    this.attributes.createdOn = new Date();
    this.attributes.modifiedOn = new Date();
    if(this.user)
      this.attributes.createdBy = this.user.username;
    if(this.user)
      this.attributes.modifiedBy = this.user.username;

    cb(null);
  };

  model.beforeSave = function(cb, user) {
    this.attributes.modifiedOn = new Date();
    if(this.user)
      this.attributes.modifiedBy = this.user.username;

    cb(null);
  };
  
  model.newValue = function(value) {
    var defer = q.defer();
    
    // Find enyine_integration settings for space 
    self.find("spaceId:"+spaceId).then(function(settings) {
      
      
      var hookUrl = settings.webHookUrl;
      var fire = (settings.postNewValue &&  settings.postNewValue === true) ? true : false;
      
      if(!fire) {
        defer.resolve({});
        return;
      }
      
      // DEBUG
      if(!hookUrl)  
        hookUrl = 'https://appspark.slack.com/services/hooks/incoming-webhook?token=htxjUq82SzaW7C0XAjR1qE16';
      
      
      var msg = "Time " + value.value + "h saved with comment " + value.comment + " for date " + value.date;
      var body = { json: {text: msg} };
      request.post(
        hookUrl,
        body,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            defer.resolve({});
          }
          else {
            defer.reject(error, response.statusCode);
          }
        }
      );
          
    }, function(err) {
          defer.reject(err);      
    });
    

    return defer.promise;     
  }

  return model;
};