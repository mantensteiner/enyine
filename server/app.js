var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    ejs = require('ejs'),
    multipart = require('connect-multiparty'),
    Config = require('./config');
    
// strict mode on app level 
// not supported by bunyan!
//require('use-strict');

// application object
var app = module.exports = express();
var env = process.env.NODE_ENV || 'development';

var config = Config({environment:env});

// config for all environments
app.set('port', config.web.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));

app.use(multipart({
  uploadDir: __dirname + '/data'
}));

// Routes 
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// Domain Apis
require('./domains/auth/api').setupAuth(app);
require('./domains/auth/api').register(app);
require('./domains/event/api').register(app);
require('./domains/user/api').register(app);
require('./domains/space/api').register(app);
require('./domains/itemtype/api').register(app);
require('./domains/item/api').register(app);
require('./domains/filter/api').register(app);
require('./domains/quantity/api').register(app);
require('./domains/valuetype/api').register(app);
require('./domains/value/api').register(app);
require('./domains/message/api').register(app);
require('./domains/note/api').register(app);
require('./domains/search/api').register(app);
require('./domains/int_github/api').register(app);
//require('./domains/vcs/api').register(app)

// handle all unmatching requests with 404
app.all('*', routes.notFound);

// Start server
http.createServer(app).listen(app.get('port'), function () {
  console.log('enyine API server listening on port ' + app.get('port'));
});
