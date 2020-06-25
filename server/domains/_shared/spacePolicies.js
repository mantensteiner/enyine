var log = require('../../utils/logger'),
    _ = require('underscore'),
    Q = require('q'),
    esRepo = require('../../utils/esRepo');

// Space policies grant privileges by checking a users space memberships 
// In this case all data is provided in process & no DB access is necessary 
// (but would be possible since policies are async, so any backend could be queried)
module.exports = {
  
  // A model which uses the space policy must provide a spaceId & a user object
  // The policy determines if the user has access to the given space 
  spaceMemberPolicy: function(model) {
    return function(actionConfig) {
      var defer = Q.defer();
      
      var query = actionConfig.query;
      var action = actionConfig.action;
      
      if(!model.user && !model.skipAuth) {
        log.error({data:{model:model, name: 'spacePolicy'}, msg: 'User must be set on model.'});
        return Q.fcall(function () { return { ok: false, model: model } });
      }
      
      var queryId = query ? (query["spaceId"] || (query.id && query.type === 'space')) : null;
      var attrId = null;
      if(model.data && model.data.spaceId)
        attrId = model.data.spaceId;

      var spaceId = attrId || queryId;

      // Allow creating spaces (id will be empty in this case)
      if(action && action === 'create' && model.type === 'space') {
          return Q.fcall(function () { return { ok: true, model: model } });        
      }
      
      // Query database for user-spaces
      esRepo({newInstance: false})
      .getById({index: 'user', type: 'user', id: model.user.id})          
      .then(function(user) {  
        // Validate single record requests (create,save,delete,findOne)
        if(spaceId) {
          // Check if the record to write is for a space where the user is a member
          if(_.findWhere(user.spaces, {id:spaceId}))
            return defer.resolve({ ok: true, model: model });
          else
            return defer.resolve({ ok: false, model: model });
        }
  
        // Validate multi record requests (get,search, findOne) - no space id
        var spacesArr = _.map(user.spaces, function(us) { return { id: us.id }; });
        if(!spacesArr || spacesArr.length == 0) 
          return defer.resolve({ ok: false, model: model });
        
        // Set auth filter clause
        model.auth = { spaces: spacesArr };
        return defer.resolve({ ok: true, model: model });
      })
      .fail(function(err) {
          if(err.status && err.status === 404)
            return defer.resolve({ ok: false, model: model });
          
          return defer.resolve(err);
      });
      
      return defer.promise;
    }
  },
  // Policy for write operations with admin privileges required
  spaceAdminWritePolicy: function(model) {
    return function() {
      if(model.attributes.id && _.findWhere(model.user.spaces, {id:model.attributes.id, admin:true}))
        return Q.fcall(function () { return { ok: true, model: model } });

      return Q.fcall(function () { return { ok: false, model: model } });
    }
  }
}
    
