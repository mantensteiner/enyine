'use strict';


/*
 Toastr notifications
 */
enyine.factory('notifier', function() {
  toastr.options = {
    "positionClass": 'toast-bottom-right'
  }

  return {
    success: function(message, manualClose) {
      if(manualClose) {
        toastr.options.timeOut = 0;
        toastr.options.closeButton = true;
      }
      else {
        toastr.options.timeOut = 6000;
        toastr.options.closeButton = false;
      }
      toastr.success(message);
    },
    error: function(message, header, manualClose) {
      if(manualClose) {
        toastr.options.timeOut = 0;
        toastr.options.closeButton = true;
      }
      else {
        toastr.options.timeOut = 6000;
        toastr.options.closeButton = false;
      }
      toastr.error(message, header ? header : "Error");
    }
  }
});