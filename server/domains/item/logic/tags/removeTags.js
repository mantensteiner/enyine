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
  if(!config.tags) 
    return q.fcall(function () { throw new ValidationError('tags missing.'); });  
  
  var defer = q.defer();
  var itemConfig = {
    user: config.user,
    fields: ["id","tags"],
    sortField: "modifiedOn",
    sortDir: "desc",
    take: 1000,
    skip: 0,
    data: { spaceId: config.spaceId }
  };
  var targetQuery = "+(spaceId:"+ config.spaceId +") +("+ config.targetQuery + ")";
 
  var operationResult = {
    changedItems: [],
    failedItems: []
  };
  
  // Avoid circular dependency by lazy loading the model
  var Item = require('../../models/item');
 
  Item(itemConfig)
  .search(targetQuery)
  .then(function(targetItems) {
    // Target Items
    targetItems = Item(itemConfig).unwrapResultRecords(targetItems);
    if(targetItems.length == 0) 
      return defer.resolve(operationResult);

    // Get tags ids for topic which must be removed
    var tagIds = _.map(config.tags, function(t) {  return t.id });
    function findTagsToRemove(tagList) {
      var tagIdsToRemove = [];
      _.each(tagIds, function(tagId) {
        if(_.findWhere(tagList, {id:tagId})) {
          tagIdsToRemove.push(tagId);
        }
      });
      return tagIdsToRemove;
    }

    // Get number of items with tags to remove
    var itemUpdates = 0;
    _.each(targetItems, function(tt) {
      var tagIdsToAdd = findTagsToRemove(tt.tags);
      if(tagIdsToAdd.length > 0)
        itemUpdates++;
    });

    if(itemUpdates== 0) 
      return defer.resolve(operationResult);

    // Iterate target items
    _.each(targetItems, function(tt) {
      var currentTags = tt.tags;
      var tagsChanged = false;
      _.each(tagIds, function(tagId) {
        var toRemove = _.findWhere(currentTags, {id:tagId});
        if(toRemove) {
          currentTags = _.without(currentTags, toRemove);
          tagsChanged = true;
        }
      });

      if(tagsChanged) {
        var saveConfig = itemConfig;
        saveConfig.data = {id:tt.id, tags: currentTags};
        Item(saveConfig)
        .save()
        .then(function(item) {
          operationResult.changedItems.push(item);
          if(--itemUpdates == 0)
            return defer.resolve(operationResult);
        })
        .fail(function(err) {
          operationResult.failedItems.push(saveConfig.data);
          log.error(err, {name: 'removeTags.save', config:config});
          return defer.reject(err);
        });
      }
    });
  })
  .fail(function(err) {
    log.error(err, {name: 'removeTags', config:config});
    return defer.reject(err);
  });
  
  return defer.promise;
}