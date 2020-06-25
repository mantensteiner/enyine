enyine.component('spaceSettingsGeneral', {
  templateUrl: '/js/app/components/space/settingsGeneral.html',
  restrict: 'E',
  controller: ['$scope', '$state', '$sce', 'spaceService', 'notifier', SpaceSettingsGeneralController],
  bindings: {
    spaceId: '<',
    activeTab: '<',
    space: '<'
  }
});

function SpaceSettingsGeneralController($scope, $state, $sce, spaceService, notifier) {
  var ctrl = this;
  
  ctrl.$onInit = function () {
    ctrl.bookmarkletUrl = "loading...";
    ctrl.topicStatus = [];
    ctrl.topicPriorities = [];
  };

  ctrl.$onChanges = function(changesObj) {
    if (changesObj.space && changesObj.space.currentValue) {
      ctrl.topicStatus = _.sortBy(ctrl.space.status, 'id');
      ctrl.topicPriorities = _.sortBy(ctrl.space.priorities, 'id');
        
      if(!ctrl.space.missionStatement)
        ctrl.editMission = true;

      var host = location.protocol + "//" + location.hostname;
      if(location.port) {
        host += ":" + location.port;
      }
      var bmScript = "javascript:location.href='" + host + "/topic/submit/" + ctrl.spaceId + 
        "?url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title)";
      ctrl.bookmarkletScript = $sce.trustAsJs(bmScript);
    }
  }

  ctrl.saveProject = function() {
    spaceService.save(ctrl.space)
      .success(function() {
        $("#editProjectModal").modal("hide");
        notifier.success("Saved changes for space!")
      })
      .error(function(err) {
        notifier.error(err.message || err.data.message);
      });
  }

  ctrl.saveDescription = function() {
    ctrl.saveProject();
    ctrl.editDescription = false;
  }

  // Mission
  ctrl.editMission = false;
  ctrl.saveMission = function() {
    if(ctrl.space.missionStatement)
        ctrl.editMission = false;        
    else
        ctrl.editMission = true;
        
    ctrl.saveProject();
  }

  ctrl.startEditMission = function() {
    ctrl.editMission = true;        
    ctrl.oldMissionStatement = ctrl.space.missionStatement;
  }

  ctrl.cancelMission = function() {
    ctrl.editMission = false;        
    ctrl.space.missionStatement = ctrl.oldMissionStatement;
  }

  //
  // Status
  ctrl.selectStatus = function(s) {
    if(!s) {
      ctrl.selectedStatus = {
        id:null,
        name: ''
      }
    }
    else {
      ctrl.selectedStatus = s;
    }
  }

  ctrl.saveStatus = function() {
    var currentId = ctrl.selectedStatus.id;
    spaceService.saveStatus(ctrl.spaceId, ctrl.selectedStatus)
    .then(function(resultStatus){
      notifier.success("Saved status '" + ctrl.selectedStatus.name + "'");

      if(ctrl.selectedStatus.id === null)
        ctrl.topicStatus.push(resultStatus.data);
      else {
        var i = _.indexOf(ctrl.topicStatus,_.findWhere(ctrl.topicStatus, {id:currentId}));
        ctrl.topicStatus[i] = resultStatus.data;
      }

      ctrl.selectedStatus = null;
      $('#editStatusModal').modal('hide');
    }, function(err) {
      notifier.error(err.message || err.data.message);
    });
  }

  ctrl.deleteStatus = function() {
    if(prompt("Really DELETE status '"+ctrl.selectedStatus.name+"' (type DELETE to confirm)?") == "DELETE") {
      spaceService.deleteStatus(ctrl.spaceId, ctrl.selectedStatus.id)
      .then(function(){
        notifier.success("Deleted status '" + ctrl.selectedStatus.name + "'");
        ctrl.topicStatus = _.without(ctrl.topicStatus, ctrl.selectedStatus);
        ctrl.selectedStatus = null;
        $('#editStatusModal').modal('hide');
      }, function(err) {
        notifier.error(err.message || err.data.message);
      });
    }
  }


  //
  // Priority
  ctrl.selectPriority = function(p) {
    if(!p) {
      ctrl.selectedPriority= {
        id:null,
        name: ''
      }
    }
    else {
      ctrl.selectedPriority = p;
    }
  }

  ctrl.savePriority = function() {
    var currentId = ctrl.selectedPriority.id;
    spaceService.savePriority(ctrl.spaceId, ctrl.selectedPriority)
    .then(function(resultPriority){
      notifier.success("Saved priority '" + ctrl.selectedPriority.name + "'");

      if(ctrl.selectedPriority.id === null)
        ctrl.topicPriorities.push(resultPriority.data);
      else {
        var i = _.indexOf(ctrl.topicPriorities,_.findWhere(ctrl.topicPriorities, {id:currentId}));
        ctrl.topicPriorities[i] = resultPriority.data;
      }

      ctrl.selectedPriority = null;
      $('#editPrioritiesModal').modal('hide');
    }, function(err) {
      notifier.error(err.message || err.data.message);
    });
  }

  ctrl.deletePriority = function() {
    if(prompt("Really DELETE priority '"+ctrl.selectedPriority.name+"' (type DELETE to confirm)?") == "DELETE") {
      spaceService.deletePriority(ctrl.spaceId, ctrl.selectedPriority.id)
      .then(function(){
        notifier.success("Deleted priority '" + ctrl.selectedPriority.name + "'");
        ctrl.topicPriorities = _.without(ctrl.topicPriorities, ctrl.selectedPriority);
        ctrl.selectedPriority = null;
        $('#editPrioritiesModal').modal('hide');
      }, function(err) {
        notifier.error(err.message || err.data.message);
      });
    }
  }  
}