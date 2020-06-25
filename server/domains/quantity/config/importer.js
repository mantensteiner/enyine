var request = require('request'),
    Papa = require('papaparse'),
	  authRequestHeaders = require('../../_shared/auth/requestHeaders'),
    config = require('../../../config')(),
    log = require('../../../utils/logger'),
    _ = require('underscore'),
    q = require('q');

// Directly start this script to import via internal API
module.exports = {  
	importUnitsCsv: function() {
    var defer = q.defer();
    
    var fs = require('fs');
    var file = fs.readFileSync(__dirname + '/data.json', 'utf8');

    // ToDo?: Convert CSV to expected JSON (see data.json for reference) for more readable quantity definition
    //var parsed = Papa.parse(file, {header: true});
    //var grouped = _.groupBy(parsed.data, 'id');

    var unitsBody = JSON.parse(file);
    
    // HTTP POST
    var url = config.web.eventUrl + '/api/quantity/import';

    console.log(url);

    request.post({
      url: url, 
      body: unitsBody, 
      headers: authRequestHeaders.setInternalAuthHeader(),
      json:true
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        log.info({
          name: 'quantity.importUnits',
          msg: 'Success'
        });
        return defer.resolve(body);
      }
      else {
        log.error(error, {name: 'quantity.importUnits', unitsBody: unitsBody});
        return defer.reject(new Error('Error importing units for quantity domain.'));
      }
    });
    
	  return defer.promise;
	}
}

module.exports.importUnitsCsv();