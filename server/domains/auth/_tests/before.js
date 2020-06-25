var chai = require('chai');
var chaiHttp = require('chai-http');
var appServer = require('../../app');
var interServiceAuth = require('../../domains/_shared/auth/interServiceAuth');
var authHeaderName = require('../../domains/_shared/auth/interServiceAuth').headerName;
var systemUser = require('../../config')().auth.systemUser;
var testUser = require('../../config')().auth.testUser;
var should = chai.should();

chai.use(chaiHttp);

describe('Auth', function() {
	before(function(done) {
		
		// Setup test environment for index 'auth.test'
		// Delete index, set mapping template, create index 
		
		done();
	});
	
	
});
