var _ = require('underscore'),
    q = require('q'),
    log = require('../../../../utils/logger'),
    ValidationError = require('../../../../utils/errors').ValidationError;

module.exports = function(config) {
  if(!config.user) 
    return q.fcall(function () { throw new ValidationError('user missing.'); });
  if(!config.spaceId) 
    return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });
  if(!config.targetQuery) 
    return q.fcall(function () { throw new ValidationError('targetQuery missing.'); }); 
  if(!config.sourceQuery) 
    return q.fcall(function () { throw new ValidationError('sourceQuery missing.'); });
    
  var defer = q.defer();
  
  var itemConfig = {
    user: config.user,
    fields: ["id","relations"],
    sortField: "modifiedOn",
    sortDir: "desc",
    take: 1000,
    skip: 0,
    data: { spaceId: config.spaceId }
  };
  var targetQuery = "spaceId:" + config.spaceId + " AND (" + config.targetQuery + ")";
  var targetItems = null;
  
  var changedItems = {
    sourceItems: [],
    targetItems: []
  };  
  
  // Avoid circular dependency by lazy loading the model
  var Item = require('../../models/item');
  
  Item(itemConfig)
  .search(targetQuery)
  .then(function(targets) {
    targetItems = Item(itemConfig).unwrapResultRecords(targets);
    var sourceQuery = "spaceId:" + config.spaceId + " AND (" + config.sourceQuery + ")";
    return Item(itemConfig).search(sourceQuery);
  })
  .then(function(sources) { // build target & source relations
    return q.fcall(function() {
      var sourceItems = Item(itemConfig).unwrapResultRecords(sources);
     
      // iterate source items
      _.each(sourceItems, function(si) {
        // remember existing relations for source item
        var timestamp = new Date();
        var sourceRelations = si.relations || [];
        
        // iterate target items
        _.each(targetItems, function(ti) {
          // no self references allowed
          if(ti.id !== si.id) {
            // build array of target items for source item update
            if(!_.findWhere(sourceRelations, {id:ti.id})) {
              sourceRelations.push({
                id: ti.id,
                createdOn: timestamp,
                createdBy: config.user.username
              });
            }
          }
                    
          // update target item with changed target relation
          var targetRelations = ti.relations || [];
          if(!_.findWhere(targetRelations, {id:si.id})) {
            var changedTi = _.findWhere(changedItems.targetItems, {id: ti.id});
            var sRel = {
              id: si.id,
              createdOn: timestamp,
              createdBy: config.user.username
            };
            if(changedTi) {
              changedTi.relations.push(sRel);
            }
            else {
              changedItems.targetItems.push({
                id: ti.id,
                relations: [sRel]
              });
            }
          }
        });
        changedItems.sourceItems.push({id: si.id, relations: sourceRelations});      
      });
    });
  })
  .then(function() { // write target items
    var deferSaveTarget = q.defer();
    var itemSaveConfig = itemConfig;
    var itemSaveCnt = changedItems.targetItems.length;
    
    if(itemSaveCnt == 0)
      return q.fcall(function(){return;});
      
    _.each(changedItems.targetItems, function(ti) {
      itemSaveConfig.data = ti;
      Item(itemSaveConfig)
      .save()
      .then(function(savedItem) {
        itemSaveCnt--;
        if(itemSaveCnt === 0)
          deferSaveTarget.resolve(changedItems.targetItems);
      })
      .fail(function(err) {
        log.error(err, {name:'addRelations.saveTargets', config:config});
        deferSaveTarget.reject(err);
      });      
    });
    return deferSaveTarget.promise;
  })
  .then(function() { // write source items
    var deferSaveSource = q.defer();
    var itemSaveConfig = itemConfig;
    var itemSaveCnt = changedItems.sourceItems.length;
    
    if(itemSaveCnt == 0)
      return q.fcall(function(){return;});
    
    _.each(changedItems.sourceItems, function(si) {
      itemSaveConfig.data = si;
      Item(itemSaveConfig)
      .save()
      .then(function(savedItem) {
        itemSaveCnt--;
        if(itemSaveCnt === 0)
          deferSaveSource.resolve(changedItems.sourceItems);
      })
      .fail(function(err) {
        log.error(err, {name:'addRelations.saveSources', config:config});
        deferSaveSource.reject(err);
      });      
    });
    return deferSaveSource.promise;
  })
  .then(function() {
    defer.resolve(changedItems);
  })
  .fail(function(err) {
    log.error(err,{name:'addRelations', config: config});
    defer.reject(err);
  });
  
  return defer.promise;
}