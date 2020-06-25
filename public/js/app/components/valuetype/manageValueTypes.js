enyine.component('manageValueTypesModal', {
  templateUrl: '/js/app/components/valuetype/manageValueTypesModal.html',
  restrict: 'E',
  controller: ['$scope', '$element', '$attrs', 'valueTypeService', 'quantityService', 'notifier', '$timeout', manageValueTypesModal],
  bindings: {
      spaceId: '<',
      itemType: '<',
      onSave: '&'
  }
});


function manageValueTypesModal($scope, $element, $attrs, valueTypeService, quantityService, notifier, $timeout) {
  var ctrl = this
  
  ctrl.quantities = [];
  ctrl.newValueType = {};
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

  $scope.$on('selectedItemType', function(event,data) {
    ctrl.spaceId = data.spaceId;
    ctrl.selectedItemType = data.itemType;
    
    loadQuantities();
    loadValueTypes();
  });

  function loadValueTypes(loadMore) {
    if(!loadMore) {
      ctrl.moreValueTypesLoading = true;
      ctrl.valueTypes = [];
      ctrl.skip = 0;
    }

    valueTypeService.get()
    .then(function(result) {
      ctrl.valueTypes.push.apply(ctrl.valueTypes, result.data);
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

  // Save
  ctrl.saveValueType = function() {
    ctrl.newValueType.spaceId = ctrl.spaceId;
    ctrl.moreValueTypesLoading = true;

    valueTypeService.save(ctrl.newValueType)
    .then(function(label) {
      notifier.success('ValueType \'' + ctrl.newValueType.name + '\’ saved!');
      $timeout(function() {
        loadValueTypes(false);
        $scope.$emit('changedValueTypes');
      }, 1000);
    }, function(err) {
      ctrl.moreValueTypesLoading = false;
      notifier.error(err.data || err);
    });
  }

  // Change
  ctrl.changeValueType = function(vt) {
    valueTypeService.save($scope.$root.cleanObject(vt))
    .then(function(label) {
      notifier.success('ValueType \'' + vt.name + '\’ saved!');
      $timeout(function() {
        $scope.$emit('changedValueTypes');
      }, 1000);    
    }, function(err) {
      ctrl.moreValueTypesLoading = false;
      notifier.error(err.data || err);
    });
  }

  // Delete
  ctrl.deleteValueType = function(vt) {
    ctrl.moreValueTypesLoading = true;
    valueTypeService.delete(vt.id)
    .then(function() {
      notifier.success('ValueType \'' + vt.name + '\’ deleted!');
      $timeout(function() {
        loadValueTypes(false);
        $scope.$emit('changedValueTypes');
      }, 1000);
    }, function(err) {
      ctrl.moreValueTypesLoading = false;
      notifier.error(err.data || err);
    });
  }
}
