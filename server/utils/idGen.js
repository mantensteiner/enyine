var uuid = require('node-uuid');

module.exports = function() {
	var id = uuid.v4();
	// replace hyphens for better out of the box elasticsearch behaviour
	// when used as id (no RFC4122 UUIDS anymore, but no need to be conform)
	return id.replace(/-/g, '');
}