var _ = require('underscore'),
    log = require('../utils/logger'); 

exports.index = function(req, res){
  res.render('index');
};

exports.notFound = function(req, res) {
  res.status(404)
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};