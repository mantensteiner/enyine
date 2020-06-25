enyine.component('editItemTypeModal', {
  templateUrl: '/js/app/components/itemtype/editItemTypeModal.html',
  restrict: 'E',
  controller: ['$scope', 'valueTypeService', 'itemTypeService', 'quantityService', 'notifier', editItemTypeModal],
  bindings: {
      onSave: '&'
  }
});


function editItemTypeModal($scope, valueTypeService, itemTypeService, quantityService, notifier) {
  var ctrl = this;

  loadQuantities();

  $scope.$on('selectedItemType', function(event,data) {
    ctrl.spaceId = data.spaceId;
    ctrl.selectedItemType = data.itemType;
    loadValueTypes();
  });

  $scope.$on('changedValueTypes', function() {
    loadValueTypes();
  });

  ctrl.selectedValueType = null;
  ctrl.quantities = [];
  ctrl.valueTypes = [];
  ctrl.take = 20;
  ctrl.skip = 0;
  ctrl.moreValueTypesLoading = false;
  ctrl.loadMoreValueTypes = function() {
    if(ctrl.moreValueTypesLoading)
      return;

    ctrl.moreValueTypesLoading = true;
    if(ctrl.valueTypes.length > 0)
      ctrl.skip += 1;
    loadValueTypes(true);
  }

  function loadValueTypes(loadMore) {
    if(!loadMore) {
      ctrl.moreValueTypesLoading = true;
      ctrl.valueTypes = [];
      ctrl.skip = 0;
    }

    valueTypeService.get()
    .then(function(result) {
      ctrl.valueTypes = result.data;
      if(ctrl.selectedItemType.valueTypes) {
        ctrl.selectedItemType.valueTypes.forEach(function(vt) {
          vt._quantity = _.findWhere(ctrl.quantities, {id: vt.quantityId});
        });
      }
      ctrl.moreValueTypesLoading = false;
    }, function(err) {
      notifier.error(err.message);
    });
  }

  function loadQuantities() {
    quantityService.get()
    .then(function(result) {
      ctrl.quantities = result.data;
      ctrl.quantitiesLoading = false;
    }, function(err) {
      notifier.error(err.message);
    });
  }

  ctrl.addSelectedValueType = function() {
    //var vt = _.findWhere(ctrl.valueTypes, {id:ctrl.selectedItemType.valueType.id});
    if(!ctrl.selectedItemType.valueTypes) {
      ctrl.selectedItemType.valueTypes = [];
    }

    ctrl.selectedItemType.valueTypes.push({
      _quantity: ctrl.selectedValueType.quantity,
      id:null,
      sourceId:ctrl.selectedValueType.id,
      quantityId:ctrl.selectedValueType.quantity.id,
      dataTypeKey:ctrl.selectedValueType.quantity.dataTypeKey,
      symbol:null,
      name: ctrl.selectedValueType.name,
      metrics: [{
        id: null,
        name: null,
        aggType: null,
        timeframe: null,
        timerange: null,
        targetValue: {
          nr_off: 0,
          nr_mul: 1
        },
      }]
    });
  }

  ctrl.removeValueType = function(valueType) {
    ctrl.selectedItemType.valueTypes= _.without(ctrl.selectedItemType.valueTypes, valueType);
  }

  ctrl.addMetric = function(valueType) {
    valueType.metrics.push({
        id: null,
        name: null,
        aggType: null,
        timeframe: null,
        timerange: null,
        targetValue: {
          nr_off: 0,
          nr_mul: 1
        },
      });
  }

  ctrl.removeMetric = function(valueType, metric) {
    valueType.metrics = _.without(valueType.metrics, metric);
  }

  ctrl.saveItemType = function() {
    var cleanToSave = getCleanSelected();
    itemTypeService.save(ctrl.spaceId, cleanToSave).success(function(itemType) {
      ctrl.selectedItemType = null;
      $("#editItemTypeModal").modal('hide');
      notifier.success('Item Type \'' + itemType.name + '\’ changed!');
      ctrl.onSave();
    }).error(function(err) {
        notifier.error(err.message);
      });
  }

  ctrl.deleteItemType = function() {
    var id = ctrl.selectedItemType.id;
    itemTypeService.delete(id, ctrl.spaceId).success(function() {
      $scope.selectedTopic = null;
      $("#addItemTypeModal").modal('hide');
      ctrl.onSave();
    });
  }

  ctrl.changeTypeName = function(vt) {
    var cleanToSave = getCleanSelected();
    itemTypeService.save(ctrl.spaceId, cleanToSave).success(function(itemType) {
      notifier.success('Saved name for \'' + vt.name + '\’!');
      ctrl.onSave();
    }).error(function(err) {
        notifier.error(err.message);
    });
  }

  function getCleanSelected() {
    if(ctrl.selectedItemType.valueTypes) {
      ctrl.selectedItemType.valueTypes.forEach(function(vt) {
        /*vt.metrics.forEach(function(m) {
          m.targetValue = {};
          m.targetValue[vt._quantity.dataTypeKey] = m._targetValue; 
          delete m._targetValue;;
        });*/
        
        delete vt._quantity;
      });
    }
    return JSON.parse(angular.toJson(ctrl.selectedItemType));
  }

  // Manage ValueTypes by showing another Modal
  ctrl.modalStack = [];
  ctrl.manageValueTypes = function(currentModal) {
    if(currentModal) {
      ctrl.modalStack.push(currentModal);
      $("#" + currentModal).modal('hide');

      $("#" + currentModal).on('hidden.bs.modal', function () {
        if(ctrl.modalStack.length > 0) {
          $("#manageValueTypesModal").modal('show');
        }
      });

      $('#manageValueTypesModal').on('hidden.bs.modal', function () {
          if(ctrl.modalStack.length > 0) {
            var topStackModal = ctrl.modalStack[ctrl.modalStack.length-1];
            $("#" + topStackModal).modal('show');       
            ctrl.modalStack.pop(topStackModal);
          }
      })
    }
  }
}
