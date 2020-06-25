var ValidationError = require('../../utils/errors').ValidationError,
    typeHelper = require('../../utils/typeHelper'),
		transactionIdHeaderName = 'x-enyine-transaction-id';

// helper to build the transaction header for requests 
module.exports = {
	copy: function(targetHeaders, sourceHeaders) {
		if(!sourceHeaders[transactionIdHeaderName])
			throw new ValidationError("transactionIdHeaderName in sourceHeaders");
			
		if(!targetHeaders) 
			targetHeaders = {};
			
		targetHeaders[transactionIdHeaderName] = sourceHeaders[transactionIdHeaderName];
	},	

	isSet: function(headers) {
		if(!headers) 
			return false;
			
		if(!headers[transactionIdHeaderName] || 
      typeHelper.getTypeName(headers[transactionIdHeaderName]) !== 'string')
			return false;
			
		return true;
	},
		
	set: function(headers, transactionId) {
		if(!transactionId)
			throw new ValidationError("transactionId");
			
		if(!headers) 
			headers = {};
			
		headers[transactionIdHeaderName] = transactionId;
	},
	
	getTransactionId: function(headers) {
		if(!headers)
			throw new ValidationError("headers");
		return headers[transactionIdHeaderName];
	}
} 