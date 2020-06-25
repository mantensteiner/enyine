var passport = require('passport'),
    config = require('../../../config')(),
    restful = require('../../../restful');

module.exports.login = function(req,res,next){
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    if(req.body.redirect) {
      req.redirectUrl = req.body.redirect;
    }
    
    passport.authenticate('google', { 
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]})
      (req, res, next);
  }
}


module.exports.redirect = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    var url = req.redirect ? req.redirect : '';
    if(!url)
      url = '/#/dash';
      
    // non-web APIs can not use this workflow anyways, so it's ok for the web-app to just redirect
    // for other API clients (eg Apps) this part must be possibly redone
    res.redirect('/#/loginExternal/' + req.user.token + '?redirectUrl=' + encodeURIComponent(url));
    
    // res.json({token: req.user.token, redirectUrl: url});
  }
}