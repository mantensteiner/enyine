var BaseModel = require('../../_shared/baseModel'),
    spacePolicies = require('../../_shared/spacePolicies'),
    seqGen = require('../../../utils/sequence'),
    log = require('../../../utils/logger'),
    q = require('q'),
    AddRelations = require('../logic/relations/addRelations'),
    RemoveRelations = require('../logic/relations/removeRelations'),
    SaveBulkData = require('../logic/saveBulkData'),
    AddTags = require('../logic/tags/addTags'),
    RemoveTags = require('../logic/tags/removeTags'),
    modelDefinition = require('../config/mapping').item.properties,
    modelShaper = require('../../_shared/modelShaper'),
    ValidationError = require('../../../utils/errors').ValidationError;

module.exports = function(modelConfig) {
  
  this.new = function() {
    var self = this;
    var model = BaseModel.create({
      index: "item",
      type: "item",
      policy: spacePolicies.spaceMemberPolicy,
    }, modelConfig);
    
    // model.validate
    model.validate = function(modelData) {
      if(!modelData.spaceId && !modelData.userId) 
        return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });
        
      return q.fcall(function () { return modelShaper({definition: modelDefinition, data: modelData}); });
    }
    
    // model.validateSave
    model.validateSave = function(modelData) {
      var defer = q.defer();
      
      model.validate(modelData)
      .then(function(data) {
        model.data = data;
        if(!model.data.id) {
          return model.create();
        }
        else {
          return model.save();
        }
      })
      .then(function(result) {
        return defer.resolve(result);
      })
      .fail(function(err) {
        log.error(err, {name: 'item.validateSave', modelData: modelData});
        return defer.reject(err);
      });
      
      return defer.promise;
    }
  
    // model.beforeCreate
    model.beforeCreateOverride = model.beforeCreate;
    model.beforeCreate = function(data) {
      var defer = q.defer();
      var record = null;
      model.beforeCreateOverride(data)
      .then(function(_record) {
        record = _record;
        var spaceTopicNumberKey = model.type + record.spaceId;
        return seqGen.next(spaceTopicNumberKey);
      })
      .then(function(nr) {
        record.number = nr;
        record.token = nr + "";
        defer.resolve(record);
      })
      .fail(function(err) {
        log.error(err, {name: 'item.beforeCreate', record: record});
        defer.reject(err);
      });
      return defer.promise;
    };
    
    // model.beforeSave
    model.beforeSaveOverride = model.beforeSave;
    model.beforeSave = function(data) {
      var defer = q.defer(); 
      model.beforeSaveOverride(data)
      .then(function(record) {
        // Keep status clean
        if(record.status) {
          record.status = {
            id: model.data.status.id,
            name: model.data.status.name
          }
        }
        // Keep owner clean
        if(record.owner) {
          record.owner = {
            id: model.data.owner.id,
            username: model.data.owner.username
          }
        }
        return q.fcall(function () { return record; });
      })
      .then(function(record) {
        defer.resolve(record);
      })
      .fail(function(err) {
        log.error(err, {name: 'item.beforeSave', data: data});
        defer.reject(err);
      });
      return defer.promise;
    };
    
    // model.addRelations 
    model.addRelations = function(config) {      
      config.user = model.user;
      return AddRelations(config);
    }
  
    // model.removeRelations 
    model.removeRelations = function(config) {
      config.user = model.user;
      return RemoveRelations(config);
    }
    
    // model.saveBulkData
    model.saveBulkData = function(config) {
      config.user = model.user;
      return SaveBulkData(config);
    }
    
    // model.addTags
    model.addTags = function(config) {
      config.user = model.user;
      return AddTags(config);
    }
    
    // model.removeTags
    model.removeTags = function(config) {
      config.user = model.user;
      return RemoveTags(config);
    }
    
    // model.saveIssue
    model.saveIssue = function(issueData) {
      var defer = q.defer();
      
      if(!issueData.spaceId) 
        return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });
      
      /*
        id: idGen(),      
        issueId: body.issue.id,
        action: body.action,
        title: body.issue.title,
        description: body.issue.body,
        state: body.issue.state,
        comments: body.issue.comments,
        createdAt: body.issue.created_at,
        modifiedAt: body.issue.updated_at,
        closedAt: body.issue.closed_at,
        assignee:  body.issue.assignee,
        labels: body.issue.labels,
        user: body.issue.user.login,
        number: body.issue.number,
        htmlUrl: body.issue.html_url,
        commentsUrl: body.issue.comments_url,
        logo_url: model.GIT_LOGO_URL
      */
      
      model.data = {
        id: issueData.id,
        spaceId: issueData.spaceId,
        name: issueData.title,
        description: issueData.description,
        token: issueData.issueId + ""
        // ToDo: enrich the result item by querying & matching other domain data (itemtype, user)
        // itemTypeId: try to match labels against itemType-query itemType-Domain against name, aliasNames
        // responsible users 
        // assigned users
      }
      
      model.findOne({token: issueData.issueId + ""})
      .then(function(item) {
        if(!item) 
          return model.create();
        else 
          return model.save();
      })
      .then(function(result) {
        defer.resolve(result);
      })
      .fail(function(err) {
        log.error(err, {name: 'item.saveIssue', issueData: issueData});
        defer.reject(err);
      });
      
      return defer.promise;
    }
  
    return model;
  }
  
  return this.new();
};
