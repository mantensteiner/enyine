enyine.service('authService', 
        ['$http', 'userService',
function ($http, userService) {  

  this.isAnonymousRoute = function(stateName) {
    if(stateName.indexOf('in.') === -1) 
      return true;
    return false;
  }
           
  this.createUser = function(user) {
    return $http.post('/api/auth/register', user)
      .success(function(data, status, headers, config) {
       return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  },

  this.login = function(user, redirect) {
    var password = user.password;

    var url = '/api/auth/login';
    if(redirect)
      url += '?redirect=' + redirect;

    return $http.post(url, user)
      .success(function(data, status, headers, config) {
        sessionStorage.setItem('token', data.token);

        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  },


  this.logout = function(cb) {
    $http.get('/api/auth/logout')
      .success(function(data, status, headers, config) {
        sessionStorage.removeItem('token');
        userService.setUser(null);
        cb();
      })
      .error(function(data, status, headers, config) {
        alert("error");
        cb();
      });
  },

  this.reset = function(email) {
    return $http.post('/api/auth/reset', {email:email})
      .success(function(data, status, headers, config) {
        sessionStorage.removeItem('token');
        
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.activate = function(token) {
    return $http.post('/api/auth/activate', {token:token})
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.resetPassword = function(token, password) {
    return $http.post('/api/auth/resetPassword', {token:token, password: password})
      .success(function(data, status, headers, config) {
        sessionStorage.removeItem('token');
        
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }

  this.getUserInfo = function(token) {
    return $http.post('/api/auth/getUserByToken', {token:token})
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });
  }
  
  this.loginGoogle = function(redirectUrl) {
    var url = '/api/auth/google/login';
    if(redirectUrl)
      url += '?redirect='+redirectUrl;
    window.location.href = url;
    /*return $http.get(url)
      .success(function(data, status, headers, config) {
        return data;
      })
      .error(function(data, status, headers, config) {
        console.log(config);
      });*/
  }

}]);