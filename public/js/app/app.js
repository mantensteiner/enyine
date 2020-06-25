jQuery.event.props.push('dataTransfer');

window.addEventListener('load', function() {
  FastClick.attach(document.body);
}, false);

// Angularjs app definition
window.enyine = angular.module('enyine', ['enyine.widgets','ngSanitize', 'ui.router', 'mgcrea.ngStrap',
  'ui.select', 'emoji','hc.marked', 'xeditable', 'ngFileUpload', 'ngDraggable',
  'isteven-multi-select', 'ngTagsInput', 'colorpicker.module', 'monospaced.elastic', 'nvd3']);

enyine.run(['$rootScope', '$state', 'editableOptions',  '$location',
  function($rootScope, $state, editableOptions, $location) {
  /*$rootScope.redirectLogin = function () {
    var mustAuth = $state.current.name.indexOf('in') === 0;

    if(mustAuth) {
      var redirectUrl = encodeURIComponent(window.location.href);
      $state.go('auth.login', {redirect:redirectUrl});
    }
  }*/


  $rootScope.xsDisplay = false;
  if($(window).width() <= 320)
    $rootScope.xsDisplay = true;

  if($rootScope.xsDisplay)
    $rootScope.projectNameLimit = 12;
  else
    $rootScope.projectNameLimit = 12;

  editableOptions.theme = 'bs3';
}]);


/*angular.module('login-redirect', [])
      .run(['$state', '$rootScope', 'userService', '$location',
    function($state, $rootScope, userService, $location) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      var mustAuth = toState.name.indexOf('in') === 0;

      if(mustAuth && !userService.isAuth()) {
        if(toState.name !== 'login') {
          event.preventDefault();
          $state.go('auth.login', {redirect:$location.hash()});
        }
      }
    });
  }]);*/

angular.module('enyine').constant('angularMomentConfig', {
  preprocess: 'unix', // optional
  timezone: 'Europe/London' // optional
});


/* 
    Intercept $httpProvider for authentication tokens
*/
angular.module("enyine").factory('authInterceptor', [
  "$q", "$window", "$location", function($q, $window, $location) {
    return {
      // optional method
      'request': function(config) {
        config.headers = config.headers || {};
        
        // Set authentication bearer token 
        if(sessionStorage.getItem('token'))
          config.headers.Authorization = 'Bearer ' +  sessionStorage.getItem('token'); 
        return config;
      },
  
      // optional method
     'requestError': function(rejection) {
        console.log(rejection);    
        return $q.reject(rejection);
      },
  
      // optional method
      'response': function(response) {
        // do something on success
        return response;
      },
  
      // optional method
     'responseError': function(rejection) {
        if(rejection.status === 401) {
          if(window.location.href.indexOf('#/login')!==-1)
            return;
          window.location.href = '/#/login?redirect='+encodeURIComponent(window.location.href);
        }
        console.log(rejection.status + ' ' + rejection.config.url + ', ' + rejection.data)
        return $q.reject(rejection);
      }
    };
  }
]);

/**
 *  Set authentication interceptor
 */
enyine.config(['$compileProvider', '$httpProvider',
  function($compileProvider, $httpProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
    
    $httpProvider.interceptors.push('authInterceptor');
  }
]);


/*
    Intercept $http-provider for automatic date string-to-object conversion
*/
enyine.config(["$httpProvider", function ($httpProvider) {
  var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

  function convertDateStringsToDates(input) {
      // Ignore things that aren't objects.
      if (typeof input !== "object") return input;

      for (var key in input) {
          if (!input.hasOwnProperty(key)) continue;

          var value = input[key];
          var match;
          // Check for string properties which look like dates.
          if (typeof value === "string" && (match = value.match(regexIso8601))) {
              var milliseconds = Date.parse(match[0])
              if (!isNaN(milliseconds)) {
                  input[key] = new Date(milliseconds);
              }
          } else if (typeof value === "object") {
              // Recurse into object
              convertDateStringsToDates(value);
          }
      }
  }

  $httpProvider.defaults.transformResponse.push(function(responseData){
      convertDateStringsToDates(responseData);
      return responseData;
  });
  
}]);



/*
   ui-select property filter
*/
enyine.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop] && item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }
});
