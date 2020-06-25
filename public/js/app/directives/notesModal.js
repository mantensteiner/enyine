enyine.directive('notesModal', notesModal);


function notesModal () {
  var directive = {
    templateUrl: '/js/app/partials/shared/notesModal.html',
    restrict: 'E'
  };
  return directive;

}