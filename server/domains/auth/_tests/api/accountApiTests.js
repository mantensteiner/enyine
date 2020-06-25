var chai = require('chai');
var chaiHttp = require('chai-http');
var appServer = require('../../../../app');
var interServiceAuth = require('../../../_shared/auth/interServiceAuth');
var authHeaderName = require('../../../_shared/auth/interServiceAuth').headerName;
var config = require('../../../../config')();
var systemUser = config.auth.systemUser;
var testUser = config.auth.testUser;
var should = chai.should();

chai.use(chaiHttp);

describe('Account', function() {	
	var activationToken = null;	
  it('should create an account for COOPA', function(done) {
		this.timeout(10000);
		chai.request(appServer)
			.post('/api/auth/register')
			.send(testUser)
			.end(function(err, res){
				res.should.have.status(200);
				activationToken = res.body.activationToken;
				done();
			});
	});
	
	it('should activate the account for COOPA', function(done) {
		this.timeout(10000);		
		chai.request(appServer)
			.post('/api/auth/activate')
			.send({
				token: activationToken
			})
			.end(function(err, res) {
				res.should.have.status(200);
				done();
			});
	});
});
