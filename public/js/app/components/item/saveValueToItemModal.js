enyine.component('saveValueToItemModal', {
  templateUrl: '/js/app/components/item/saveValueToItemModal.html',
  restrict: 'E',
  controller: ['valueService', 'notifier', '$timeout', SaveValueToItemModal],
  bindings: {
    spaceId: '<',
    item: '<',
    selectedValue: '<',
    valueType: '<',
    onSave: '&',
    onDelete: '&'
  }
});

function SaveValueToItemModal(valueService, notifier, $timeout) {
  var ctrl = this;

  // Init
  ctrl.$onInit = function() {    
    if(!ctrl.selectedValue) {
      ctrl.selectedValue = {
        date: new Date(),
        value: {}
      };

    ctrl.selectedValue.value[ctrl.valueType.dataTypeKey] = 1000;
    ctrl.selectedValue.value[ctrl.valueType.dataTypeKey+'_range'] = 1000;
      
    }
  }

  ctrl.formatNumber = function(nr) {
    ctrl.selectedValue.value[ctrl.valueType.dataTypeKey]  = nr * 1;
  }

}