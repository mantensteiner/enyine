var assert = require("assert"),
		BaseModel = require('../../baseModel'),
    ValidationError = require('../../../../utils/errors').ValidationError;
		
describe('BaseModel', function() {
  var repo = {}; // repo = null would activate the default repository
  var logger = { error: function(){} };
    it('should initialize config', function () {
      var model = BaseModel.create({
        index: 'testindex',
        type: 'testtype',
        user: {username:'birdo'},
        fields: ['f1', 'f2'],
        repository: repo // mock repo
      },null);
      assert.equal('testindex', model.index);
      assert.equal('testtype', model.type);
      assert.equal('birdo', model.user.username);
      assert.equal('f2', model.fields[1]);
    });
    
    it('should throw config error on missing index, type', function (done) {
      try {
         var model = BaseModel.create({repository:repo, logger: logger});
         done("expected exception");
      } catch(err) {
        if(err instanceof ValidationError)
          return done();
        return done(err);
      }
    });
  
    it('has default policies with promises', function (done) {
      var model = BaseModel.create({index: 'test', type: 'test', repository: repo, user:{username:'birdo'}});
      model.policy['save']()
      .then(function(savePolicyResult) {
        assert.equal(true, savePolicyResult.ok);
        return model.policy['search']();
      })
      .then(function(searchPolicyResult) {
        assert.equal(true, searchPolicyResult.ok); 
        assert.equal(true, searchPolicyResult.ok);
        
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });
});