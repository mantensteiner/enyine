var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    routes = require('./routes'),    
    http = require('http'),
    Config = require('./config');

// application object
var app = module.exports = express();
var env = process.env.NODE_ENV || 'development';

var config = Config({environment:env});

app.set('port', config.web.port_eventstore);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(morgan('dev'));

// Domain Apis
require('./domains/event/apiInternal').register(app);  
require('./domains/quantity/apiInternal').register(app);  
  
// handle all unmatching requests with 404
app.all('*', routes.notFound);

// Start server
http.createServer(app).listen(app.get('port'), function () {
  console.log('enyine event store API listening on port ' + app.get('port'));
});
