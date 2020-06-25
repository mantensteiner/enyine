// use the elasticsearch repository for the data operations from the server-app
var esRepo = require('../../server/utils/esRepo')(),
    Q = require('q'),
    _ = require('underscore');

// migrate data from a type in an index to a new index 
// important: setup new indextemplate+index before with setTemplate+createIndex commands
module.exports = function(oldIndex, oldType, newIndex, newType, done) {
    
  esRepo.get({
    index: oldIndex,
    type: oldType,
    skip:0,
    take: 10
  }).then(function(records) {
    var i = 0;
    indexRecord(records[i]);
    
    function indexRecord(r) {
      if(oldType === 'action') 
          r = cleanAction(r);
      if(oldType === 'project') 
          r = cleanProject(r);
      if(oldType === 'note') 
          r = cleanNote(r);
          
      esRepo.create({
        index: newIndex,
        type: newType,
        record: r,
        forceIndex: false
      }).then(function(result) {
        if(i < records.length-1) {
          i++;
          return indexRecord(records[i])
        }
        else 
          return done();
      }, function(err) {
         return done(Error('error indexing record ' + r.id));
      });
    }
  }, function(err) {
    return done(Error('error processing elasticsearch get'));
  });
  
  /*
      transform & clean data of type records for new index
  */
  
  // action-event
  function cleanAction(r) {
      if(r.action) 
          r.operation = r.action;
          
      // Change the demo user to a better one
      if(r.user) {
          delete r.user.email;
          if(r.user.username === 'badengineer') {
              r.user.username = 'red.fox';
          }
      }
      
      var result = _.pick(r,  ['id', 'projectId', 'recordId', 'type', 'description', 'timestamp', 'user', 'operation']);
      result.domain = result.type;
      
      return result;
  }
  
  // project-project
  function cleanProject(r) {
      if(r.sys_noUpdate)  delete r.sys_noUpdate;
      return r;
  }
  
  // note-note
  function cleanNote(r) {
    r.spaceId = '';
    delete r.projectId;
    delete r.users;
    
    return r;
  }
}