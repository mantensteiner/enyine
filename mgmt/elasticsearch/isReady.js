var esRepo = require('./esRepository');

module.exports = function(done) {  
  (function checkInfo() {
    esRepo.getInfo(function(err, result) {
      if(err) {
        console.log('elasticsearch not available');
        setTimeout(checkInfo, 5000);    
      }
      // else if(err) {
      //   console.log('exiting');
      //   done(Error(err));
      // }
      else {
        console.log('Elasticsearch available ' + JSON.stringify(result));
        done();
      }
    });
  })();
}