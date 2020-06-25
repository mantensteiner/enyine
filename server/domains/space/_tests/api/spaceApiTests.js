var chai = require('chai');
var chaiHttp = require('chai-http');
var appServer = require('../../app');
var interServiceAuth = require('../../domains/_shared/auth/interServiceAuth');
var authHeaderName = require('../../domains/_shared/auth/interServiceAuth').headerName;
var systemUser = require('../../config')().auth.systemUser;
var testUser = require('../../config')().auth.testUser;
var should = chai.should();

chai.use(chaiHttp);

describe('Spaces', function() {
  var header = {};
  var eventStore = require('../../eventStore'); // start eventStore
  interServiceAuth.setHeaderToken({user: systemUser}, header); // set internal service auth token
  
	it('should list ALL spaces on /api/space/get GET', function(done) {
		chai.request(appServer)
			.get('/api/space/get')
			.set(authHeaderName, header[authHeaderName])
			.end(function(err, res){
				res.should.have.status(200);
				done();
			});
	});
  
  it('should add a SINGLE space on /api/space/create POST', function(done) {
    chai.request(appServer)
      .post('/api/space/create')
      .set(authHeaderName, header[authHeaderName])
      .send({name:'apiTestSpace'})
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        done();
    });
  });
});
