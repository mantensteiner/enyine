var spacePolicies = require('../../_shared/spacePolicies'),
    BaseModel = require('../../_shared/baseModel'),
    emailService = require('../../../utils/emailService'),
    log = require('../../../utils/logger'),
    idGen = require('../../../utils/idGen'),
    q = require('q'),
    moment = require('moment'),
    _ = require('underscore'),
    eventNamespaces =  require('../../_shared/eventNamespaces');
    

module.exports = function(modelConfig) {
  this.new = function() {
    var self = this;
    var model = BaseModel.create({
      index: "user",
      type: "user",
      //policy: spacePolicies.spaceMemberPolicy,
    }, modelConfig);
  
    // model.createFromAccount
    model.createFromAccount = function(accountData) {
      var defer = q.defer();
      
      model.data = {
        id: accountData.id,
        username: accountData.username,
        email: accountData.email,
        aliasNames: [{
          source: 'enyine',
          name: accountData.username
        }],
        acceptInvitations : true // accept invitations per default
      };
      
      model.create()
      .then(function(user) {
        defer.resolve(user);
      })
      .fail(function(err) {
        log.error(err, {accountData: accountData, name: 'user.createFromAccount'});
        defer.reject(err);
      });
      
      return defer.promise;
    }
    
    // model.saveSpaceMembers
    model.saveSpaceMembers = function(memberConfig) {
      var defer = q.defer();
      
      var userCnt = memberConfig.userIds.length;
      
      if(userCnt === 0) {
        var err = new Error("memberConfig.userIds does not contain data.");
        log.error(err, {memberConfig: memberConfig, name: 'user.saveSpaceMembers'});
        return q.fcall(function() { throw err; })      
      }
      
      updateUser();
      function updateUser() {
        model.getById(memberConfig.userIds[userCnt-1])
        .then(function(user) {
          if(!user)
            throw new Error('user not found');
            
          if(!user.spaces)
            user.spaces = [];
          
          var userSpace = _.findWhere(user.spaces, {id: memberConfig.spaceId});
          if(!userSpace) {
            user.spaces.push({id: memberConfig.spaceId, name: memberConfig.spaceName});
          }
          else {
            // ToDo: debug if value is really changed
            userSpace.name = memberConfig.spaceName;
          }
          
          model.data = {
            id: user.id,
            spaces: user.spaces
          };
          //model.disableEventLog = true;
          return model.save();
        })
        .then(function(result) {
          userCnt--;
          if(userCnt === 0)
            defer.resolve(result);
        })
        .fail(function(err) {
          log.error(err, {memberConfig: memberConfig, name: 'user.saveSpaceMembers'});
          defer.reject(err);
        });
      }
      
      return defer.promise;
    }
    
    // model.removeSpaceFromMembers
    model.removeSpaceFromMembers = function(spaceConfig) {
      var defer = q.defer();
      var query = "spaces.id:" + spaceConfig.spaceId;
      model.search(query)
      .then(function(users) {
        users = model.unwrapResultRecords(users);
        var updCnt = users.length
        _.each(users, function(user) {
          removeSpaceFromUser(user);
        });
        function removeSpaceFromUser(user) {
          var updUsr = self.new();
          updUsr.data = {
            id: user.id,
            spaces: _.without(user.spaces, _.findWhere(user.spaces, {id: spaceConfig.spaceId}))
          };
          
          updUsr.save()
          .then(function() {
            updCnt--;
            if(updCnt === 0)
              return defer.resolve();
          })
          .fail(function(err) {
            return defer.reject(err);
          });
        }
      })
      .fail(function(err) {
        log.error(err, {spaceConfig: spaceConfig, name: 'user.setSpaceMember'});
        defer.reject(err);
      });
      
      return defer.promise;
    }
    
    // model.sendSpaceInvite
    model.sendSpaceInvite = function(inviteConfig) {
      var defer = q.defer();
      
      var options = {
        token: idGen(),
        tokenExpires: moment().add('days', 14).toISOString(),
        invitationFrom: inviteConfig.invitationFrom,
      };
      
      model.getById(inviteConfig.userId)
      .then(function(user) {
        if(!user.acceptInvitations) {
          var err = new Error("User does not accept invitations");
          err.code = 403;
          throw err;
        }
        var space = _.findWhere(user.spaces, {id: inviteConfig.spaceId});
        var pendingInvitation = _.findWhere(user.spaceInvitations, {spaceId:space.id});
        if(pendingInvitation) {
          var err = new Error("There is already an invitation pending for this user and space");
          err.code = 403;
          throw err;
        }
        options.email = user.email;
        options.name = user.username;
        options.spaceName = space.name;

        if(!user.spaceInvitations)
          user.spaceInvitations= [];
        user.spaceInvitations.push({
          spaceName: space.name,
          spaceId: space.id,
          token: options.token
        });
        
        model.data = {
          id: user.id,
          spaceInvitations: user.spaceInvitations
        };
        return model.save();
      })
      .then(function(user) {
        return emailService.sendSpaceInvite(options);
      })
      .then(function() {
        return defer.resolve(options);      
      })
      .fail(function(err) {
        log.error(err, {inviteConfig: inviteConfig, name: 'user.sendSpaceInvite'});
        defer.reject(err);
      });
      
      return defer.promise;
    }
  
    // model.confirmJoinToSpace
    model.confirmJoinToSpace = function(joinConfig) {
    var defer = q.defer();
    
      var mailOptions = {};
      model.findOne({"spaceInvitations.token": joinConfig.token})
      .then(function(user) {
        if(!user)
          throw new Error("User not found for invitation token " + joinConfig.token);
        if(user.id !== model.user.id) {
          var err = new Error("It is not allowed to confirm space invitations for other users!");
          err.code = 403;
          throw err;
        }
                
        var invitation = _.findWhere(user.spaceInvitations,{ token: joinConfig.token });
        user.spaceInvitations = _.without(user.spaceInvitations, invitation);
        
        mailOptions.email = user.email;
        mailOptions.name = user.username;
        mailOptions.spaceName = invitation.spaceName;
        
        var inst = self.new();
        inst.data = {
          id: user.id,
          spaceInvitations: user.spaceInvitations
        }
        
        // notify subscribers
        if(joinConfig.confirm === true) {
          inst.namespaces.push(eventNamespaces.userJoinedSpace);
          inst.eventMetaData = {spaceId: invitation.spaceId };
        }
        
        return inst.save();
      })
      .then(function(user) {
        if(joinConfig.confirm === true)
          return emailService.sendSpaceInviteConfirm(mailOptions);
        else
          return emailService.sendSpaceInviteDismiss(mailOptions);
      })
      .then(function(mailResult) {
        defer.resolve(mailResult);
      })
      .fail(function(err) {
        log.error(err, {joinConfig: joinConfig, name: 'user.confirmJoinToSpace'});
        defer.reject(err);
      });
      
      return defer.promise;
    }
    
    return model;
  }
  return this.new();
};
