enyine.component('manageFiltersModal', {
  templateUrl: '/js/app/components/item/manageFiltersModal.html',
  restrict: 'E',
  controller: ['filterService', 'utilityService', 'notifier', '$timeout', ManageFiltersModalController],
  bindings: {
    spaceId: '<',
    fullQuery: '<',
    lazyLoadFilters: '<',
    selectedFilterItemTypeIds: '<',
    onSave: '&'
  }
});

function ManageFiltersModalController(filterService, utilityService, notifier, $timeout) {
  var ctrl = this;
  
  // Init
  ctrl.$onInit = function() {
    ctrl.filters = [];
    ctrl.selectedFilter = null;
    ctrl.newFilterName = null;
  };


    // Init
  ctrl.$onChanges = function(changes) {
    if(changes.lazyLoadFilters && changes.lazyLoadFilters.currentValue) {
      loadFilters();
    }
  };

  function loadFilters(cb) {
      filterService.getBySpace(ctrl.spaceId, "*").then(function(data) {
        ctrl.filters = data;
      },
      function(err) {
        notifier.error(err.message);
      });
  }


  ctrl.selectFilter = function(id) {
    utilityService.leaveModal('#manageFilters', 'in.items', {id:ctrl.spaceId, listMode: 'list', filter: id, filterQuery: ''});
  }

  ctrl.saveNewFilter = function() {
    var filter = {
      name: ctrl.newFilterName,
      filter: {
        text: ctrl.fullQuery,
        itemTypes: ctrl.selectedFilterItemTypeIds 
      }
    }

    filterService.save(ctrl.spaceId, filter).then(function(_filter){
      notifier.success("New Filter '" + filter.name + "' created!");
      ctrl.filters.splice(0,0 ,_filter.data);
    }, function(err){
      notifier.error(err.message);
    });
  }

  ctrl.deleteFilter = function(id) {
    if(confirm("Really delete filter?")) {
      filterService.delete(id, ctrl.spaceId).then(function(_filter) {
        notifier.success("Filter deleted!");
        ctrl.filters = _.without(ctrl.filters, _.findWhere(ctrl.filters,{id:id}));
      }, function(err){
        notifier.error(err.message);
      });
    }
  }
};