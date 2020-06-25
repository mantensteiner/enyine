enyine.component('createItemModal', {
  templateUrl: '/js/app/components/item/createItemModal.html',
  restrict: 'E',
  controller: ['$scope', 'spaceService', 'itemService', 'itemTypeService', 'notifier', '$timeout', 
    CreateItemModalController],
  bindings: {
    spaceId: '<',
    itemStatus: '<',
    onSave: '&'
  }
});

function CreateItemModalController($scope, spaceService, itemService, itemTypeService, notifier, $timeout) {
  var ctrl = this;
  
  // Init
  ctrl.$onInit = function() {
    ctrl.itemTypes = [];
    ctrl.selectedItemTypes = null;
    ctrl.busy = false;
    
    loadItemTypes(function(err, markup) {
      if(err) return;
      ctrl.filterItemTypesMarkup = markup;
    })
  };

  function loadItemTypes(cb) {
    cb = cb || function() {};
    itemTypeService.getBySpace(ctrl.spaceId, '*', 10000, 0).then(function(itemTypes) {
      ctrl.itemTypes = itemTypes;
      cb(null, itemTypeService.buildMarkup(ctrl.itemTypes));
    }, function(err) {
      notifier.error(err.message);
      cb(err.message);
    });
  }

  // Create item
  ctrl.createItem = function() {
    ctrl.newItem.spaceId = ctrl.spaceId;
    
    /*if(ctrl.newItem.status) {
      ctrl.newItem.status = _.findWhere(ctrl.itemStatus,{id: ctrl.newItem.status.id*1});
    }*/

    if(ctrl.selectedItemTypes) {
      ctrl.newItem.itemTypeId = _.map(ctrl.selectedItemTypes, function(el) { return el.id; })[0];
    }

    itemService.save(ctrl.newItem)
      .then(function(item) {
        ctrl.busy = true;
        $timeout(function() {
          ctrl.busy = false;
          $('#createItemModal').modal('hide');
          notifier.success('Item \'' + item.name + '\’ created!');
          ctrl.onSave();
          ctrl.newItem = null;
        }, 1000);
      }, function(err) {
        ctrl.busy = false;
        notifier.error(err.message);
      });
  }
};