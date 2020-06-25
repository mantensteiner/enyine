'use strict';

/* Filters */

angular.module('enyine.filters', []).
  filter('interpolate', function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  });



angular.module('enyine.filters', [])
  .filter('topicState', function (topic) {
    return function (id) {

      if(topic.status.id === id)
        return topic;
    };
  });