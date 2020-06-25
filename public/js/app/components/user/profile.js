enyine.component('userProfile', {
  templateUrl: '/js/app/components/user/profile.html',
  restrict: 'E',
  controller: ['$scope', 'Upload', '$rootScope', '$state', '$stateParams', 'userService', 
               'spaceService', 'notifier', '$timeout', UserProfileController]
});

function UserProfileController($scope, Upload , $rootScope, $state, $stateParams, userService,
    spaceService, notifier, $timeout) {
  var ctrl = this;

  ctrl.user = null;
  ctrl.spaces = [];
  ctrl.avatarUrl = "/img/avatar.jpeg";

  ctrl.aliasConfig = {
    sources:[{name:'enyine'},{name:'github'}]
  }
  

  function loadUser() {
    userService.getUser().success(
      function(user) {
        userService.getById(user.id)
          .success(function(data) {
            ctrl.user = data;
            ctrl.avatarUrl = "api/user/getAvatar/" + ctrl.user.id;
            loadSpaces();
          })
          .error(function(err){
            notifier.error(err.message);
          });
      }).error(function(err) {
        notifier.error(err.message);
      });
  }
  loadUser();

  ctrl.plans = [];
  function loadPlans() {
    ctrl.plans = [{
        name: 'Micro',
        price: 3,
        spaces: 2,
        currency: 'USD'
      },{
        name: 'Mini',
        price: 5,
        spaces: 5,
        currency: 'USD'
      },{
        name: 'Professional',
        price: 7,
        spaces: 10,
        currency: 'USD'
      },{
        name: 'Ultimate',
        price: 12,
        spaces: 20,
        currency: 'USD'
      }
    ];
  }
  loadPlans();

  function loadSpaces() {
    ctrl.spaces = [];
    _.each(ctrl.user.spaces, function(p) {
      spaceService.getById(p.id)
        .success(function(data) {
          data.userIsAdmin = _.findWhere(data.users, {id: ctrl.user.id, admin: true}) ? true : false;
          ctrl.spaces.push(data);
        })
        .error(function(err){
          notifier.error(err.message);
        });
    });
  }

  ctrl.saveUser = function() {
    userService.save(ctrl.user)
      .success(function(data) {
        notifier.success("Saved profile changes!");
      })
      .error(function(err){
        notifier.error(err.message);
      });
  }

  ctrl.selectedSpace = null;
  ctrl.selectSpace = function(p) {
    ctrl.selectedSpace = p;
  }

  ctrl.leaveSpace = function(p) {
    spaceService.removeUser(p.id, ctrl.user.id).success(function() {
      ctrl.spaces = _.without(ctrl.spaces, p);
    }).error(function(err) {
      notifier.error(err.message);
    });
  }


  ctrl.addFile = function(){
    var f = document.getElementById('myAvatarFile').files[0],
        r = new FileReader();

    //r.onloadend = function(e) {
    //  var data = e.target.result;
      //send your binary data via $http or $resource or do anything else with it
      ctrl.upload = Upload.upload({
        url: 'api/user/uploadAvatar',
        //withCredentials: true,
        //data: {myObj: ctrl.myModelObj},
        file: f
      }).progress(function(evt) {
          console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(data, status, headers, config) {
          // file is uploaded successfully
          $timeout(function(){
            ctrl.avatarUrl = "api/user/getAvatar/" + ctrl.user.id;
          }, 3000);
        })
        .error(function(err) {
          notifier.error(err.message);
        });
    //}
    //r.readAsBinaryString(f);
  }

  ctrl.onImageSelect = function($files) {
    ctrl.avatarUrl = "/img/avatar.jpeg";
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      ctrl.upload = Upload.upload({
        url: 'api/user/uploadAvatar',
        //withCredentials: true,
        data: {myObj: ctrl.myModelObj},
        file: file
      }).progress(function(evt) {
          console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(data, status, headers, config) {
          // file is uploaded successfully
          $timeout(function(){
            ctrl.avatarUrl = "api/user/getAvatar/" + ctrl.user.id;
          }, 3000);
        })
        .error(function(err) {
          notifier.error(err.message);
        });
    }
  };


  ctrl.onFileSelect = function($files) {
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      ctrl.upload = Upload.upload({
        url: 'api/user/uploadFile', //upload.php script, node.js route, or servlet url
        //method: 'POST' or 'PUT',
        //headers: {'header-key': 'header-value'},
        //withCredentials: true,
        data: {myObj: ctrl.myModelObj},
        file: file 
      }).progress(function(evt) {
          console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(data, status, headers, config) {
          // file is uploaded successfully
          console.log(data);
        });
    }
  };
  
  /**
  *   Aliases
   */
  ctrl.addAlias = function(sourceName, name) {
    ctrl.user.aliasNames.push({source: sourceName, name: name});
      ctrl.saveUser();
  }
  
  ctrl.removeAlias = function(aliasToDelete) {
    if(aliasToDelete) {
      ctrl.user.aliasNames = _.without(ctrl.user.aliasNames, aliasToDelete);
      ctrl.saveUser();
    }
  }

}