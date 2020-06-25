var esRepo = require('./esRepository');

module.exports = function(index, done) {

    esRepo.indexExists(index)
    .then(function(exists) {
        if(!exists) {
            console.log(`Creating new index ${index}`);
            esRepo.createIndex(index)
            .then(function(result) {
                done();         
            })
            .fail(function(err) {
                done(Error('error processing elasticsearch createIndex'));
                console.error(err);
            });
        }
        else {
            console.log(`Index ${index} already exists`);
        }
    });
}
