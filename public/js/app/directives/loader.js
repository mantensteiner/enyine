enyine.directive('loader', enyineLoader);


function enyineLoader () {
  var directive = {
    link: link,
    templateUrl: '/js/app/partials/elements/spinner1.html',
    restrict: 'EA',
    scope: {
      show: '=show',
      text: '=text'
    }
  };
  return directive;

  function link(scope, element, attrs) {
    /* */
  }
}