enyine.component('spaceSettingsGithub', {
  templateUrl: '/js/app/components/space/settingsGithub.html',
  restrict: 'E',
  controller: ['$scope','$state','$stateParams','githubService','notifier', SpaceSettingsGithubController],
  bindings: {
    spaceId: '<',
    activeTab: '<'
  }
});

function SpaceSettingsGithubController($scope, $state, $stateParams, githubService, notifier) {
  var ctrl = this;

  // Init
  ctrl.$onInit = function () {
    ctrl.githubIntegrations = [];
    ctrl.integrationsLoading = false;
    ctrl.currentRepo = null;
  };

  // Detect if tab becomes active
  ctrl.$onChanges = function (changesObj) {
    if (changesObj.activeTab && changesObj.activeTab.currentValue == 'github') {
      loadGithubIntegationsForSpace();      
    }
  };
  
  function loadGithubIntegationsForSpace() {
    ctrl.integrationsLoading = true;
    
    githubService.getBySpace(ctrl.spaceId)
    .then(function(integrations) {
      ctrl.githubIntegrations = integrations;
      if(ctrl.githubIntegrations.length > 0)
        ctrl.currentRepo = ctrl.githubIntegrations[0];
      
      ctrl.integrationsLoading = false;
    }, function(err) {
      notifier.error(err.message || err.data.message);
    });
  }
  
  ctrl.newRepository = function() {
    ctrl.currentRepo = {};
  }
  
  ctrl.saveRepository = function() {
    ctrl.integrationsLoading = true;
    ctrl.currentRepo.spaceId = ctrl.spaceId;
    githubService.save(ctrl.currentRepo)
    .then(function(result) {
      notifier.success("Saved github repository.");
      loadGithubIntegationsForSpace();
    }, function(err) {
      notifier.error(err.message || err.data.message);
    });
  }
  
  ctrl.deleteRepository = function() {
    githubService.delete(ctrl.currentRepo.id)
    .then(function(result) {
      notifier.success("Deleted github repository.");
      loadGithubIntegationsForSpace();
    }, function(err) {
      notifier.error(err.message || err.data.message);
    });
  }
  
}