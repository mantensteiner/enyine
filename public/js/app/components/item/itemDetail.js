enyine.component('itemDetail', {
  templateUrl: '/js/app/components/item/itemDetail.html',
  restrict: 'E',
  controller: ['$state', '$stateParams', 'itemService', 'spaceService', 'itemTypeService', 'tagService', 'utilityService',
               'notifier', '$timeout', '$sce', 'valueService', 'messageService', 'emojiService', ItemDetailController],
  bindings: {
      spaceId: '<'
  }
});

function ItemDetailController($state, $stateParams, itemService, spaceService, itemTypeService, tagService, utilityService,
       notifier, $timeout,$sce,valueService,messageService,emojiService) {
  var ctrl = this;

    // Init
  ctrl.$onInit = function() {
    ctrl.spaceId = $stateParams.spaceId || ctrl.$parent.spaceId;
    ctrl.tab = $stateParams.tab;
    ctrl.spaceName = null
    ctrl.id = $stateParams.id;
    ctrl.item = null;
    ctrl.itemStatus = [];
    ctrl.itemPriorites = [];
    ctrl.activeTab = 'detail';
    ctrl.itemInProgress = false;
    ctrl.showSideNav = false;
    ctrl.select2Options = {
      'multiple': true,
      'simple_tags': true
    };

    ctrl.emojis = emojiService.emojis();

    init();
    function init() {
      loadItem();
      loadStatus();
      loadPriorities();
      loadSpace();
      loadMessages();
    }
  }

  // Side navigation (DISABLED)
  /*
  ctrl.toggleSideNav = function() {
    ctrl.showSideNav = !ctrl.showSideNav;
    if(ctrl.showSideNav === true)
      $scope.$broadcast('showSideNav');
  }
  function loadSideNavPinned() {
      ctrl.showSideNav = (localStorage.pin_side_nav && localStorage.pin_side_nav == 'true' ? true : false);
      if(ctrl.showSideNav === true)
        $scope.$broadcast('showSideNav');
  }
  */

  ctrl.viewLoading = function() {
    return ctrl.itemInProgress;
  }

  function loadItem() {
    ctrl.itemInProgress = true;
    if(!ctrl.spaceId || !ctrl.id)
      return;
    itemService.getById(ctrl.spaceId, ctrl.id).success(function(item) {
      ctrl.item = item;

      //loadSideNavPinned();        

      loadItemTypes();

      ctrl.itemInProgress = false;
    });
  }

  function loadStatus() {
    spaceService.getStatus(ctrl.spaceId).success(function(status) {
      ctrl.itemStatus = status;
    });
  }

  function loadPriorities() {
    spaceService.getPriorities(ctrl.spaceId).success(function(prios) {
      ctrl.itemPriorities = prios;
    });
  }
  
  function loadSpace() {
    if(ctrl.spaceId) {
      spaceService.getById(ctrl.spaceId).success(function(p) {
        ctrl.space = p;
        ctrl.spaceName = p.name;
      }).error(function(err) {
          notifier.error(err);
        });
    }
  }

  ctrl.setMood = function(e) {
    ctrl.item.mood = e;
    ctrl.changeMood = false;
  }


  ctrl.saveItem = function() {
    if(ctrl.item.status) {
      var st = _.findWhere(ctrl.itemStatus,{id: ctrl.item.status.id});
      ctrl.item.status = { id:st.id, name: st.name };
    }
    if(ctrl.item.priority) {
      var prio = _.findWhere(ctrl.itemPriorities,{id: ctrl.item.priority.id});
      ctrl.item.priority = { id:prio.id, name: prio.name };
    }
    if(ctrl.item.owner) {
      var usr = _.findWhere(ctrl.space.users,{id: ctrl.item.owner.id});
      ctrl.item.owner = { id:usr.id, username: usr.username };
    }

    var _tmpItemTypes =  ctrl.item.itemTypes;

    if(ctrl.item.itemTypes && ctrl.item.itemTypes[0])
      ctrl.item.itemTypes = _.map(ctrl.item.itemTypes, function(el){return el.id});
      
    // Fix for enyine
    //ctrl.item.itemTypeId = ctrl.item.itemTypes[0];

    itemService.save(ctrl.item).success(function() {
      notifier.success("Item saved!")
      ctrl.item.itemTypes = _tmpItemTypes;
    },function(err) {
      notifier.error("Could not save item.");
      ctrl.item.itemTypes = _tmpItemTypes;
    });
  }

  ctrl.deleteItem = function() {
    var spaceId = ctrl.item.spaceId;
      if(confirm("Really delete Item?")) {
        ctrl.itemInProgress = true;
        itemService.delete(ctrl.item.id, spaceId)
        .then(function () {
          $timeout(function () {
            ctrl.itemInProgress = false;
            $state.go("in.items", {id: spaceId, listMode: '', filter: '', view: 'items', filterQuery: ''});
          }, 1500);
        }, function(err) {
          notifier.error(err.message);      
        });
      }
  }
  
  
  //
  // Messages
  ctrl.messages = [];
  function loadMessages() {
    var q = "relations.id:"+ctrl.id;
    messageService.getBySpace(ctrl.spaceId, q).then(function(result) {
      ctrl.messages = result;
    }, function(err) {
      notifier.error("Could not load comments.");          
    });
  }
  
  ctrl.setEditComment = function(val) {
    ctrl.editComment = val;
  }

  ctrl.replyComment = function() {
    ctrl.replyComment = true;
  }

  ctrl.saveReply = function(comment, commentId) {
    var message = {
      id: commentId ? commentId : null,
      spaceId: ctrl.item.spaceId,
      content: comment,
      relations: [{id:ctrl.item.id,entity: 'item'}]
    };
    messageService.save(message).success(function(result) {
      if(!commentId)
        ctrl.messages.splice(0,0,result);
      notifier.success("Comment saved!");
    });
  }

  ctrl.deleteReply = function(commentId) {
    messageService.delete(commentId, ctrl.item.spaceId).success(function(result) {
      ctrl.messages = _.without(ctrl.messages, _.findWhere(ctrl.messages, {id: commentId}));          
      notifier.success("Comment deleted!");
    });
  }
  
  // 
  // 

  ctrl.itemTypes = [];
  function loadItemTypes() {
    ctrl.itemTypesLoading = true;
    ctrl.itemTypes = [];
    var skip = 0;
    var take = 10000;

    itemTypeService.getBySpace(ctrl.spaceId, '*', take, skip).then(function(itemTypes) {
      ctrl.itemTypes = itemTypes;
      ctrl.itemTypesLoading = false;
      ctrl.itemType = _.findWhere(ctrl.itemTypes, {id:ctrl.item.itemTypeId});
      ctrl.valueTypes = ctrl.itemType.valueTypes;
    }, function(err) {
      notifier.error(err.message);
    });
  }

  //
  // < Tags - PROTOTYPE
  ctrl.loadTags = function(query) {
    return tagService.getBySpace(ctrl.spaceId, "name:" + query + "*");
  }

  ctrl.tagAdded = function(tag) {
    if(!ctrl.item.tags)
      ctrl.item.tags = [];

    tagService.getBySpace(ctrl.spaceId, "name:" + tag.name).then(function(tags){
      if(tags.length == 0) {
        // Create new tag & save tag in item
        tagService.save(ctrl.spaceId, tag).then(function(_tag){
          notifier.success("New Tag '" + tag.name + "' created!");
          
          var targetQuery = "item.id:" + ctrl.item.id;
          tagService.addItemTags(ctrl.spaceId, targetQuery, [_tag.data])
          .then(function(){
            notifier.success("Added Tag to Item");
          },
            function(err) {
              notifier.error(err.message);
            });
        }, function(err){
          notifier.error(err.message);
        });
      }
      else {
        var tagToAdd = _.findWhere(tags,{name: tag.name});
        var targetQuery = "item.id:" + ctrl.item.id;
        tagService.addItemTags(ctrl.spaceId, targetQuery, [tagToAdd])
        .then(function(){
          notifier.success("Saved Tags for Item");
        },
          function(err) {
            notifier.error(err.message);
          });
      }
    },function(err){
      notifier.error(err.message);
    });
  }

  ctrl.tagRemoved = function(tag) {
    if(!tag.id) {
      notifier.error('Tag can not be removed');
      return;
    }
    
    var targetQuery = "item.id:" + ctrl.item.id;
    tagService.removeItemTags(ctrl.spaceId, targetQuery, [tag])
    .then(function(){
      notifier.success("Removed Tags for Item");
    },
      function(err) {
        notifier.error(err.message);
      });
  }

  // Tags >
  //





  /*
  *   Ressources
  */
  ctrl.selectedRessource = null;
  ctrl.selectedRessourceEmbed = null;
  ctrl.selectRessource = function(r) {
    ctrl.selectedRessource = r;
    if(ctrl.selectedRessource) {
      ctrl.selectedRessourceUrl = $sce.trustAsResourceUrl(ctrl.selectedRessource.link);
      ctrl.selectedRessourceEmbed = $sce.trustAsHtml(ctrl.selectedRessource.embed);
    }
    else {
      ctrl.selectedRessourceUrl = null;
      ctrl.selectedRessourceEmbed = null;
    }
  }

  ctrl.saveRessource = function() {
    if(!ctrl.item.ressources)
      ctrl.item.ressources = [];

    ctrl.selectedRessource.modifiedOn = new Date();
    // Create
    if(!ctrl.selectedRessource.id) {         
      ctrl.selectedRessource.id = ctrl.item.ressources.length == 0 ? 1 : (
        ctrl.item.ressources[ctrl.item.ressources.length-1].id+1);
      ctrl.item.ressources.push(ctrl.selectedRessource);
    }
    // Update
    else {
      var i =  _.indexOf(ctrl.item.ressources, _.findWhere(ctrl.item.ressources, {id:ctrl.selectedRessource.id}));
      ctrl.item.ressources[i] = ctrl.selectedRessource;
    }

    ctrl.saveItem();
  }

  ctrl.deleteRessource = function(r) {
    ctrl.item.ressources = _.without(ctrl.item.ressources, _.findWhere(ctrl.item.ressources, r));
    ctrl.saveItem();
  }

  ctrl.switchTab = function(tabName) {
    if(!tabName)
      return;

    //$state.go("in.space_item", {spaceId: ctrl.spaceId, id: ctrl.id, tab:tabName});

    setTab(tabName);
  }

  setTab(ctrl.tab);
  function setTab(tabName) {
    if(!tabName)
      return;

    ctrl.activeTab = tabName;
  }

  ctrl.getFromNow = function(date) {
    return utilityService.getFromNow(date);
  }
}