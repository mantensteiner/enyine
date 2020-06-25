
var Search = require('./models/search'),
    errorObjBuilder = require('../_shared/errorObjBuilder');

exports.searchGlobal = function(req, res) {
  var query =
    "(" + (req.body.search ? req.body.search : '*') + ")"; // AND (_missing_:private OR private:false)";
    
  Search({
    user: req.user,
    take: req.body.take ? req.body.take : 20,
    skip: req.body.skip ? req.body.skip : 0,
  })
  .searchGlobal(query)
  .then(function(results) {
    res.json(results);
  },
  function(err){
    res.status(500).json(errorObjBuilder('searchGlobal', 'Search', err));
  });
}
