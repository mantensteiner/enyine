enyine.component('editValueModal', {
  templateUrl: '/js/app/components/value/editValueModal.html',
  restrict: 'E',
  controller: ['$scope', 'spaceService', 'valueService', 'itemService', 'notifier', '$timeout', 
    EditValueModalController],
  bindings: {
    spaceId: '<',
    valueId: '<',
    onSave: '&'
  }
});

function EditValueModalController($scope, spaceService, valueService, itemService, notifier, $timeout) {
  var ctrl = this;
  
  // Init
  ctrl.$onInit = function() {
      ctrl.selectedItem = {};
      ctrl.selectedValue = {
        date: new Date(),
        value: {}
      };
      ctrl.itemNames = [];
  }

  // Detect if tab becomes active
  ctrl.$onChanges = function (changesObj) {
    if (changesObj.valueId && changesObj.valueId.currentValue) {
      loadItemNames();
      loadValue();
    }
  }

  function loadValue() {
      valueService.getById(ctrl.spaceId, ctrl.valueId)
        .then(function(result) {
          ctrl.selectedValue = result;

          if(result.items && result.items.length>0) {
            itemService.getById(ctrl.spaceId, result.items[0].id)
              .then(function(valueItemResult) {
                ctrl.selectedItem.selected = valueItemResult.data;      
              });
          }
        },function(err) {
          notifier.error(err.message);
        });
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

  // Update value
  ctrl.saveValue = function() {      
    if(!ctrl.selectedValue.valueType) {
      return notifier.error('No value type/unit selected for value.');
    }

    ctrl.selectedValue.spaceId = ctrl.spaceId;        
    
    ctrl.selectedValue.items = [{
      id: ctrl.selectedItem.selected.id,
      itemTypeId: ctrl.selectedItem.selected.itemTypeId || null
    }];

    // Detect if no specific time entered (must be a non-time date, add 12 hours to be safe about timezones) 
    if(moment(ctrl.selectedValue.date).hours()== 0 && 
      moment(ctrl.selectedValue.date).minutes()== 0 &&
      moment(ctrl.selectedValue.date).seconds()== 0 &&
      moment(ctrl.selectedValue.date).millisecond()== 0) {
        ctrl.selectedValue.date = moment(ctrl.selectedValue.date).add(12, 'hours')._d;
    }

    var updateFields = ['value', 'comment', 'items', 'date'];
    valueService.save(ctrl.selectedValue, null, updateFields)
      .then(function(value) {
        ctrl.busy = true;
        $timeout(function() {
          ctrl.busy = false;
          $('#editValueModal').modal('hide');
          notifier.success('Value updated!');
          ctrl.onSave();
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