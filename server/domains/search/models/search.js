var spacePolicies = require('../../_shared/spacePolicies'),
    AuthorizationError = require('../../../utils/errors').AuthorizationError,
    config = require('../../../config')(),
    BaseModel = require('../../_shared/baseModel'),
    q = require('q'),
    _ = require('underscore');

module.exports = function(modelConfig) {
  var model = BaseModel.create({
    index: "user",
    type: "user",
    policy: spacePolicies.spaceMemberPolicy,
  }, modelConfig);

  // domainConfig: {INDEX1:['TYPE1','TYPE2',...],...}
  model.searchGlobal = function (query, domainConfig) {
    var defer = q.defer();
    var domainNames = null;
    var typeNames = '*';
    if(!domainConfig) { // default if no domainConfig
      domainNames = config.globalSearchDomainsWhitelist.toString(); 
    }
    else {
      typeNames = '';
      _.each(_.keys(domainConfig), function(domainName) {
        typeNames += domainConfig[domainName].toString() + ',';
      });
      typeNames = typeNames.substring(0, typeNames.length-1);
      domainNames = _.keys(domainConfig).toString();
    }
    
    // globalSearchDomainsWhitelist
    model.policy["search"]({action:'query'})
    .then(function(policyResult) {
      if(policyResult.ok || model.skipAuth) {
        model.index = domainNames; 
        model.type = null;// typeNames; //space,item,itemtype,note,value'; ToDo: restrict in config?
        return model.search(query);
      }
      throw new AuthorizationError(model.type + '.search');
    })
    .then(function(result) {
      defer.resolve(result);
    })
    .fail(function(err) {
      defer.reject(err);
    });
    
    return defer.promise;
  }

  return model;
};
