/*
    Kept as reference until re-implemented in item detail again after the great refactoring
*/

enyine.controller('TopicDetailSideNavController',
  ['$scope', '$rootScope', '$q', '$state', '$stateParams', 'topicService', 'projectService', 'labelService', 'notifier', 'queryCacheService', '$timeout',
    function ($scope, $rootScope, $q, $state, $stateParams, topicService, projectService, labelService, notifier, queryCacheService, $timeout) {
      $scope.loadingTopics = false;
      $scope.projectId = $stateParams.projectId || $scope.$parent.projectId;
      $scope.tab = $stateParams.tab;
      $scope.projectName = null
      $scope.topics = [];
      $scope.labels = [];
      $scope.init = false;
      $scope.selectedTopic = null;
      $scope.take = 25;
      $scope.skip = 0;
      $scope.sortDir = 'desc';
      $scope.sortBy = 'modifiedOn';
      $scope.moreTopicsLoading = false;
      $scope.isPinned = false;
      $scope.query = {
        fromCache : true,
        query: '*',
        isCachedQuery: false
      }
      
      function init() {     
        $timeout(function() {
          $('#detailSideNav').css({'height':(($(window).height()+100))+'px'});                    
        }, 1000);
          
        loadTopics();
        loadLabels();  
        loadSideNavPinned();
        $scope.init = true;
      }
      
      $scope.$on('showSideNav', function() {
        if(!$scope.init)
          init();
      });

      function loadTopics() {
        $scope.loadingTopics = true;
        if(!$scope.projectId)
          return;
        
        if($scope.query.fromCache === false) {
          $scope.query.query = '*';
          $scope.query.isCachedQuery = false;
        }
        else {
          var queryFromCache = queryCacheService.getTopicsQuery($scope.fullQuery);
        
          if(queryFromCache) {
            $scope.query.query = queryFromCache;
            $scope.query.isCachedQuery = true;
          }
        }
          
        topicService.getByProject($scope.projectId, $scope.query.query, $scope.take, $scope.skip, null, null, $scope.sortBy, $scope.sortDir).then(function(topics) {       
          $scope.topics.push.apply($scope.topics, topics);
          
          $scope.selectedTopic = _.findWhere($scope.topics, {id: $scope.$parent.id});
          
          $scope.loadingTopics = false;
        }, function(err) {
          notifier.error(err.message);
        });
      }
      
            
      function loadLabels() {
        $scope.labels = [];
        var skip = 0;
        var take = 10000;

        labelService.getByProject($scope.projectId, '*', take, skip).then(function(labels) {
          $scope.labels = labels;
        }, function(err) {
          notifier.error(err.message);
        });
      }
      
      function loadSideNavPinned() {
         $scope.isPinned = (localStorage.pin_side_nav && localStorage.pin_side_nav == 'true' ? true : false);
      }
      

      $scope.loadMoreTopics = function() {
        if($scope.loadingTopics)
          return;

        $scope.skip += 1;
          
        loadTopics();
      }
      
      $scope.resetCachedQuery = function() {
        $scope.topics = [];
        $scope.skip = 0;
        $scope.query.fromCache = false;
        queryCacheService.setTopicsQuery(null);
        loadTopics();       
      }
      
      $scope.selectTopic = function(t) {
        $scope.$emit('selectedTopic', {topic:t});
        $scope.selectedTopic = t;
      }
      
      $scope.getLabel = function(t) {
        if(t.labels && t.labels.length > 0)
         return _.findWhere($scope.labels, {id:t.labels[0]});
      }

      
      

      $scope.toggleSideNavPin = function() {
        $scope.isPinned = !$scope.isPinned;
        if($scope.isPinned  === true) {
          localStorage.pin_side_nav = "true";
        }
        else {
          localStorage.removeItem('pin_side_nav');
        }
      }
      
    }]);


