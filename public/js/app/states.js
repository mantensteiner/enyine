enyine.config(['$urlRouterProvider','$stateProvider',
  function($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider

      // Off (not logged in)
      .state('off', {
        url:'/',
        abstract: true,
        views: {
          '': {
            templateUrl: 'js/app/partials/container.html'
          },
          'nav':{
            //component: 'navbarLoggedOut'
            templateUrl: 'js/app/partials/nav_loggedout.html'
          },
          'footer':{
            templateUrl: 'js/app/partials/footer.html'
          }
        }
      })

      // Homepage
      .state('off.home', {
        name: 'home',
        url: "",
        component: 'homePage'
      })

      // Features
      .state('off.features', {
        name: 'features',
        url: "features",
        component: 'homeFeatures'
      })

      // Pricing
      .state('off.pricing', {
        name: 'pricing',
        url: "pricing",
        component: 'homePricing'
      })

      // About
      .state('off.about', {
        name: 'about',
        url: "about",
        component: 'homeAbout'
      })

      // Privacy statement
      .state('off.privacy', {
        name: 'privacy',
        url: "privacy",
        component: 'legalPrivacy'
      })

      // Terms of service
      .state('off.tos', {
        name: 'terms_of_service',
        url: "terms_of_service",
        component: 'legalTermsOfService'
      })

      // Signup
      /*.state('off.signup', {
        name: 'signup',
        url: "signup",
        component: 'signup'
      })*/

      // Auth
      .state('auth', {
        url:'/',
        abstract: true,
        views: {
          '': {
            templateUrl: 'js/app/partials/container.html'
          },
          'nav':{
            templateUrl: 'js/app/partials/nav_loggedout.html'
          },
          'footer':{
            templateUrl: 'js/app/partials/footer.html'
          }
        }
      })

      // Login
      .state('auth.login', {
        name: 'login',
        url:'login?redirect',
        component: 'login'
      })
      
      // external auth providers redirect endpoint
      /// provide tokens, redirect as params,query string in URL and fetch logged in user
      .state('auth.loginExternal', {
        url:'loginExternal/:token',
        controller: ['userService', '$location', '$stateParams', function(userService, $location, $stateParams) {
          sessionStorage.setItem('token', $stateParams.token);
          userService.getUser().then(function() {
            var url = $location.search().redirectUrl ? $location.search().redirectUrl : '/#/dash';
            window.location.href = url;
          });
        }]
      })

      // Account signup      
      .state('auth.signup', {
        name: 'signup',
        url: "signup",
        component: 'signup'
      })

      // Account activation
      .state('auth.activate', {
        name: 'activate',
        url:'activate/:token?reset',
        component: 'activate'
      })

      // Password reset
      .state('auth.reset', {
        name: 'reset',
        url:'reset',
        component: 'resetPassword'
      }) 

      // In
      .state('in', {
        url:'/',
        abstract: true,
        views: {
          '': {
            templateUrl: 'js/app/partials/container.html'
          },
          'nav':{
            templateUrl: 'js/app/partials/nav.html'
          },
          'footer':{
            templateUrl: 'js/app/partials/footer.html'
          }
        }
      })

      // Dashboard
      .state('in.dashboard', {
        name: 'dashboard',
        url: "dash",
        component: 'dashboard'
      })

      // Join space confirm
      .state('in.space_join', {
        name: 'joinSpace',
        url: "space/join/:token/:name",
        component: 'joinSpace'
      })

      // Item list
      .state('in.items', {
        name: 'itemList',
        url: "space/:id/items/:listMode/:filter/:filterQuery",
        component: 'itemList'
      })

      // Items Bulk Edit
      .state('in.items_bulk_edit', {
        name: 'itemsBulkEdit',
        url: "space/:id/itemsedit/:targetQuery/:targetInfo",
        component: 'itemsBulkEdit'
      })

      // Items Bulk Edit Relations
      .state('in.items_relations', {
        name: 'itemsRelations',
        url: "space/:id/itemrelations/:targetQuery/:targetInfo",
        component: 'itemsRelations'
      })

      // Item detail
      .state('in.item_detail', {
        name: 'itemDetail',
        url: "space/:spaceId/item/:id/:tab",
        component: 'itemDetail'
      })
        
      // Notes
      .state('in.notes', {
        name: 'notes',
        url: "space/:spaceId/notes/:noteId",
        component: 'notes'
      })

      // Board
      .state('in.board', {
        name: 'board',
        url: "space/:id/{view:board}",
        component: 'board'
      })

      // ItemTypes
      .state('in.itemtypes', {
        name: 'itemTypeList',
        url: "space/:id/{view:itemtypes}",
        component: 'itemTypeList'
      })

      // Value list
      .state('in.values', {
        name: 'valueList',
        url: "space/:id/values",
        component: 'valueList'
      })

      // Space settings
      .state('in.space_settings', {
        name: 'valueList',
        url: "space/:id/settings",
        component: 'spaceSettings'
      })
      
      // User profile
      .state('in.user_profile', {
        name: 'valueList',
        url: "profile",
        component: 'userProfile'
      })

      // Search
      .state('in.search', {
        name: 'search',
        url: "search/:term",
        component: 'search'
      })

      // Logout
      .state('in.logout', {
        name: 'logout',
        url: "logout",
        component: 'logout'
      })

  }]);
