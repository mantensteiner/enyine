var _ = require('underscore'),
    q = require('q'),
    log = require('../../../utils/logger'),
    ValidationError = require('../../../utils/errors').ValidationError;

module.exports = function(config) {
  if(!config.user) 
    return q.fcall(function () { throw new ValidationError('user missing.'); });
  if(!config.spaceId) 
    return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });
  if(!config.targetQuery) 
    return q.fcall(function () { throw new ValidationError('targetQuery missing.'); }); 
  if(!config.bulkData) 
    return q.fcall(function () { throw new ValidationError('bulkData missing.'); });
    
  var defer = q.defer();
  var itemConfig = {
    data: { spaceId: config.spaceId },
    user: config.user,
    fields: ["id","status","owner","date"],
    sortField: "modifiedOn",
    sortDir: "desc",
    take: 1000,
    skip: 0
  }

  var operationResult = {
    changedItems: [],
    failedItems: []
  };
  
  // Avoid circular dependency by lazy loading the model
  var Item = require('../models/item');
  
  var targetQuery = "spaceId:"+ config.spaceId +" AND ("+ config.targetQuery + ")";
  Item(itemConfig)
  .search(targetQuery)
  .then(function(targetItems) {
    
    targetItems = Item(itemConfig).unwrapResultRecords(targetItems);
    if(targetItems.length == 0) 
      return defer.resolve(operationResult);

    // Iterate target topics (must be set, null=undefined)
    var updCnt = targetItems.length;
    _.each(targetItems, function(ti) {
      var updData = { id: ti.id };

      // Status
      if(config.bulkData.status) {
        updData.status = {
          id: config.bulkData.status.id,
          name: config.bulkData.status.name
        }
      }

      // Owner/Responsible User (must be set, null=undefined)
      if(config.bulkData.owner) {
        updData.owner = {
          id: config.bulkData.owner.id,
          username: config.bulkData.owner.username
        }
      }

      // Event Date
      if(config.bulkData.date !== undefined) {
        if(config.bulkData.date == null) {
          updData.date = null
          updData.hasDate = false;
        }
        else {
          updData.date = new Date(config.bulkData.date);
          updData.hasDate = true;
        }
      }
      
      _.extend(itemConfig.data, updData);
      
      // save item
      var itemSave = Item(itemConfig);
      itemSave.data = itemConfig.data;
      itemSave.save()
      .then(function(item) {
        operationResult.changedItems.push(item);
        tryFinish();
      })
      .fail(function(err) {
        // do not fail if one
        operationResult.failedItems.push(ti);
        log.error(err, {name: 'item.save', itemConfig:itemConfig});
        tryFinish();
      });
      
      function tryFinish() {
        updCnt--;
        if(updCnt === 0)
          defer.resolve(operationResult);
      }
    });
  })
  .fail(function(err) {
    log.error(err, {name: 'saveBulkData', config:config});
    defer.reject(err);
  })
  
  return defer.promise;
}
