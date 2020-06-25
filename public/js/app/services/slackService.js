
enyine.service('slackService', ['$http', function ($http) {

  this.postNewTime = function(message, slackWebHooks) {

    _.each(slackWebHooks, function(wh) {
      $http.post(wh, {"text": message});
    });
  }
}]);