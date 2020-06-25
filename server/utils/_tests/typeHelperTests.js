var assert = require("assert"),
		typeHelper = require('../typeHelper'),
		ValidationError = require('../errors').ValidationError;
		
describe('TypeHelper', function() {
	
    it('should give back type name as string', function () {
			assert.equal('string', typeHelper.getTypeName('test'));
			assert.equal('date', typeHelper.getTypeName(new Date()));
			assert.equal('number', typeHelper.getTypeName(123));
			assert.equal('boolean', typeHelper.getTypeName(true));
			assert.equal('error', typeHelper.getTypeName(new Error('test')));
			assert.equal('object', typeHelper.getTypeName(new ValidationError('test')));
			assert.equal('object', typeHelper.getTypeName({ test: 'test' }));
			assert.equal('function', typeHelper.getTypeName(function(){}));
    });
		
});