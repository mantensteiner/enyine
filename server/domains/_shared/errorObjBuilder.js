
// Avoid code duplication of this common pattern in domain controllers
module.exports = function(method, domainName, err) {
    if(!err) err = {};
    console.error(`${method}, ${domainName}, ${err}`);
		
    if(method && domainName) {
      return new Error(err || err.message || `Sorry, an error occured on the operation "${method}" for the type "${domainName}".`);
    } else {
      return new Error('An error occured.');  
    }
}