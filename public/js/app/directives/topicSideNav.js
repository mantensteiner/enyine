enyine.directive('topicSideNav', topicSideNav);


function topicSideNav () {
  var directive = {
    templateUrl: '/js/app/partials/topic_sidenav.html',
    restrict: 'E'
  };
  return directive;

}