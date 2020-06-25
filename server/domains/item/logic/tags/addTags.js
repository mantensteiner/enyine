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
    var timestamp =  new Date();

    // Target Items
    targetItems = Item(itemConfig).unwrapResultRecords(targetItems);
    if(targetItems.length == 0) 
      return defer.resolve(operationResult);

    // Get tags ids for item which must be added
    var tagIds = _.map(config.tags, function(t) {return t.id});
    function findTagsToAdd(tagList) {
      var tagIdsToAdd = [];
      _.each(tagIds, function(tagId) {
        if(!_.findWhere(tagList, {id:tagId})) {
          tagIdsToAdd.push(tagId);
        }
      });
      return tagIdsToAdd;
    }

    // Get number of items with tags to add
    var itemUpdates = 0;
    _.each(targetItems, function(tt) {
      var tagIdsToAdd = findTagsToAdd(tt.tags);
      if(tagIdsToAdd.length > 0)
        itemUpdates++;
    });

    if(itemUpdates== 0) 
      return defer.resolve(operationResult);

    // Iterate target items
    _.each(targetItems, function(tt) {

      // Get tags ids for item which must be added
      var currentTags = tt.tags || [];
      var tagIdsToAdd = findTagsToAdd(currentTags);

      if(tagIdsToAdd.length > 0) {
        var tagsToAdd = _.map(config.tags, function(t) {
          var tagRelation = {
            id: t.id,
            name: t.name,
            createdOn: timestamp,
            createdBy: config.user.username
          }
          return tagRelation;
        });
        currentTags = currentTags.concat(tagsToAdd);
        
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
          log.error(err, {name: 'addTags.save', config:config});
          return defer.reject(err);
        });
      }
    });
  })
  .fail(function(err) {
    log.error(err, {name: 'addTags', config:config});
    return defer.reject(err);
  });
  
  return defer.promise;
}