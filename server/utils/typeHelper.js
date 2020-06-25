module.exports = {
	// get the name of a fields data type
	getTypeName: function(obj) {
		// eg Object.prototype.toString.call(obj) => '[Object String]' => 'string'
		return Object.prototype.toString.call(obj)
			.replace('[','')
			.replace(']','')
			.split(' ')[1]
			.toLowerCase();
	}
}