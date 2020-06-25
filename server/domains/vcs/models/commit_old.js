var BaseModel = require('../../_shared/baseModel'),
    q = require('q'),
    _ = require('underscore'),
    moment = require('moment'),
    //User = require('../../user/models/user'),
    //Value = require('../../value/models/value'),
    //Item = require('../../item/models/item'),
    //Space = require('../../space/models/space'),
    //ItemType = require('../../itemtype/models/itemtype'),
    modelDefinition = require('../config/mapping').vcs.commit.properties,
    modelShaper = require('../../_shared/modelShaper');


module.exports = function(modelConfig) {
  
  this.new = function() {
    var model = BaseModel.create({
      index: "vcs",
      type: "commit",
      sortField: "modifiedOn",
      sortDir: "desc"
    }, modelConfig);
      
    model.beforeCreate = function(cb) {
      var self = this;
      var space = Space();
      space.search("space.id:"+self.attributes.spaceId).then(function(_space) { // FIND PROJECT
        var _p = _space.hits.hits[0]._source;
        var githubTimeUnit = _.findWhere(_p.units, {id: _p.githubSelectedTimeUnit});
        if(!githubTimeUnit)
          return;
  
        // parse message for time value
        var iT = self.attributes.message.indexOf('#time:');
        var timeVal = 1;
        if(iT !== -1) {
          var tVal = self.attributes.message.split('#time:')[1].split(' ')[0] * 1;
          if (!isNaN(tVal)) {
            timeVal = tVal;
            // Remove time hash tag from comment
            self.attributes.message = self.attributes.message.replace('#time:' + timeVal, '');
          }
        }
  
        var iToken = self.attributes.message.indexOf('#token:');
        var tokenVal = null;
        if(iToken !== -1) {
          tokenVal = self.attributes.message.split('#token:')[1].split(' ')[0] + "";
          self.attributes.message = self.attributes.message.replace('#token:' + tokenVal, '');
        }
  
        var t = {
          comment: self.attributes.message.trim(),
          commitId: self.attributes.id,
          spaceId: self.attributes.spaceId,
          date: moment(self.attributes.timestamp).format("YYYY-MM-DD"),
          value: timeVal,
          createdBy: self.attributes.committer.username,
          modifiedBy: self.attributes.committer.username,
          unit: {id: githubTimeUnit.id, symbol: githubTimeUnit.symbol}
        }
  
  
        var user = new User();
        var userQuery = 'username:' + self.attributes.committer.username +
          ' OR aliasNames:' + self.attributes.committer.username;
        user.search(userQuery, null, true).then(function(_user) { // FIND USER via username or alias
  
          var topic = new Item();
          var topicQuery = 'spaceId:' + self.attributes.spaceId;
  
          if(tokenVal) {
            topicQuery += ' AND token:' + tokenVal;
            topic.search(topicQuery).then(function(_topic) { // FIND TOPIC via token
              // Set topic if exact hit for token
              if(_topic.hits && _topic.hits.total == 1) {
                var tobj = _topic.hits.hits[0]._source;
                t.topics=[];
                if(!tobj.itemTypes || tobj.itemTypes.length == 0) {
                  t.topics= [{id: tobj.id}]; // Just relate to topic
                  createTime();
                }
                else {
                  var itemTypeQuery = "";
                  _.each(tobj.itemTypes, function(l) {
                    itemTypeQuery += "+(itemType.id:" + l + ") ";
                  })
                  var itemType = new ItemType();
                  // ItemTypes: Load all time [h] itemTypes and connect
                  itemType.search(itemTypeQuery).then(function(_itemTypes) {
                    _.each(_itemTypes.hits.hits, function(_l) {
                      t.topics.push({
                        id: tobj.id,
                        itemTypeId: _l._source.id
                      })
                    });
                    createTime();
                  });
                }
              }
            }, function(err) {
              cb(err);
            });
  
          }
          else {
            createTime(); // Do not set any topics,itemTypes
          }
  
  
          function createTime() {
            // TIME
            var time = new Value();
  
            // Only automap user if exact hit
            if(_user.hits && _user.hits.total == 1) {
              var uobj = _user.hits.hits[0]._source;
              t.createdBy = uobj.username;
              t.modifiedBy = uobj.username;
              t.responsible = {
                id: uobj.id,
                email: uobj.email,
                username: uobj.username
              }
            }
  
            // SAVE TIME
            time.create(t).then(function(){
              cb(null);
            },function(err) {
              console.log(err);
              cb(err);
            });
          }
        }, function(err) {
          cb(err);
        });
      });
    };
  
    return model;
  }
  
  return this.new();
};
