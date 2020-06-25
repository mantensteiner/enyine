enyine.directive('saveValueModal', saveValueModal);


function saveValueModal () {
  var directive = {
    templateUrl: '/js/app/partials/shared/saveValueModal.html',
    restrict: 'E'
  };
  return directive;

}
