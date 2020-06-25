enyine.component('createValueModal', {
  templateUrl: '/js/app/components/value/createValueModal.html',
  restrict: 'E',
  controller: ['$scope', 'spaceService', 'valueService', 'itemService', 'notifier', '$timeout', 
    CreateValueModalController],
  bindings: {
    spaceId: '<',
    selectedUnit: '<',
    onSave: '&'
  }
});

function CreateValueModalController($scope, spaceService, valueService, itemService, notifier, $timeout) {
  var ctrl = this;
  
  // Init
  ctrl.$onInit = function() {
      ctrl.selectedItem = {};
      ctrl.selectedValue = {
        date: new Date(),
        value: {}
      };
      ctrl.itemNames = [];
      loadItemNames();
  }

  // Detect if tab becomes active
  ctrl.$onChanges = function (changesObj) {
    if (changesObj.selectedUnit && changesObj.selectedUnit.currentValue) {
      ctrl.selectedUnit = changesObj.selectedUnit.currentValue;
      ctrl.selectedValue.value[ctrl.selectedUnit.dataTypeKey] = 1000;
      ctrl.selectedValue.value[ctrl.selectedUnit.dataTypeKey+'_range'] = 1000;
    }
  }

  function loadItemNames() {
    itemService.getBySpace(ctrl.spaceId, '*', 10000, 0, ['name','id']).then(function(itemNames) {
      ctrl.itemNames = itemNames;
    });
  }

  ctrl.getItemName = function(id) {
    var res = _.findWhere(ctrl.itemNames, {id: id});
    if(res) {
      return res.name;
    }
  }

  // Create value
  ctrl.createValue = function() {      
    if(!ctrl.selectedValue.valueType && !ctrl.selectedUnit) {
      return notifier.error('No value type/unit selected for value.');
    }

    ctrl.selectedValue.spaceId = ctrl.spaceId;        
    
    if(ctrl.selectedItem.selected) {
      ctrl.selectedValue.items = [{
        id: ctrl.selectedItem.selected.id,
        itemTypeId: ctrl.selectedItem.selected.itemTypeId || null
      }];
    }

    if(!ctrl.selectedValue.valueType) {
      ctrl.selectedValue.valueType = {
        id: ctrl.selectedUnit.sourceId,
        metricId: null,
        quantityId: ctrl.selectedUnit.quantityId,
        symbol: ctrl.selectedUnit.symbol,
        factor:null,
        dataTypeKey: ctrl.selectedUnit.dataTypeKey
      }
    }

    // Detect if no specific time entered (must be a non-time date, add 12 hours to be safe about timezones) 
    if(moment(ctrl.selectedValue.date).hours()== 0 && 
      moment(ctrl.selectedValue.date).minutes()== 0 &&
      moment(ctrl.selectedValue.date).seconds()== 0 &&
      moment(ctrl.selectedValue.date).millisecond()== 0) {
        ctrl.selectedValue.date = moment(ctrl.selectedValue.date).add(12, 'hours')._d;
    }

    valueService.save(ctrl.selectedValue)
      .then(function(value) {
        ctrl.busy = true;
        $timeout(function() {
          ctrl.busy = false;
          $('#createValueModal').modal('hide');
          notifier.success('Value created!');
          ctrl.onSave();
          ctrl.selectedValue = null;
        }, 1000);
      }, function(err) {
        ctrl.busy = false;
        notifier.error(err.message);
      });
  }

  ctrl.formatNumber = function(nr) {
    ctrl.selectedValue.value[ctrl.selectedUnit.dataTypeKey]  = nr * 1;
  }
}