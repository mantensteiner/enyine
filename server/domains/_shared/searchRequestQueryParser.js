
// This is a common pattern for the .search request used in most domain controllers
module.exports = function(req) {
		if(!req.body)
			throw new Error('No request body');
			
    var queryClauses = req.body.query ? ['('+ req.body.query + ')'] : [];
    if(req.body.spaceId) {
      queryClauses.push("(spaceId:" + req.body.spaceId + ")");
    }
		
    return queryClauses.join(' AND ');
}