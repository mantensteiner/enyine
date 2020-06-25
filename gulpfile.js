var gulp = require('gulp'),
    //config = require('./gulp.config')(),
    path = require('path'),
    folders = require('gulp-folders'),
    mkdirp = require('mkdirp'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    pathToFolder = './server/data',
    $ = require('gulp-load-plugins')({lazy: true}),
    exec = require('child_process').exec;

    
var colors = $.util.colors;
var envenv = $.util.env;
    
 /*
  *   Create data folder, e.g. for temp file uploads
  */
gulp.task('create_data_folder', function() {
  mkdirp(pathToFolder, function(err) {
    // success
    log(`Created folder ${pathToFolder}`);
  });
});   

/*
*   Code checking
*/
gulp.task('code_check', function() {
  log('Analyzing source with JSHint and JSCS');
  
  return gulp.src('./server/**/*.js')
    //.pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'), {verbose: true});
});


/**
*   Unit tests
*/
gulp.task('unit_tests', function () {
  log('Executing unit tests');
    
  return gulp.src('./server/**/*UnitTests.js')
    .pipe(mocha())
    .once('error', function (err) {
      console.error(err);
      process.exit(1);
    })
    .once('end', function () {
      process.exit();
    });
});

/**
*   Api tests
*/
gulp.task('api_tests', function () {
  setupTestIndex('command', 'command_test', ['command'], function(err) {
    setupTestIndex('auth', 'auth_test', ['account', 'accountStats'], function(err) {
      setupTestIndex('user', 'user_test', ['user'], function(err) {
        console.log('run account api tests');
        return gulp.src('./server/**/accountApiTests.js')
          .pipe(mocha())
          .once('error', function (err) {
            console.error(err);
            process.exit(1);
          })
          .once('end', function () {
            process.exit();
          });
      });
    });
  });
});

gulp.task('default', ['create_data_folder','code_check','unit_tests']);

/**
 *  Setup elasticsearch index for api tests
 */
function setupTestIndex(domainName, indexName, typeNames, cb) {
  // delete index
  exec('node mgmt/mgmt.js -deleteindex ' + indexName + '.1', function (err, stdout, stderr) {
    if(err) cb(err);
    var fullIndexName = indexName + '.1';
    log(`deleted index ${fullIndexName}`);
    // create index
    exec('node mgmt/mgmt.js -createindex ' + indexName, function (err, stdout, stderr) {
      if(err) cb(err);
      log(`created index ${indexName}`);      
      // set mapping
      typeNames.forEach(function(typeName, i) {
        log(`set mapping for ${domainName} ${fullIndexName} ${typeName}`);
        exec(`node mgmt/mgmt.js -setmapping ${domainName} ${fullIndexName} ${typeName}`, function (err, stdout, stderr) {
          if(i == typeNames.length-1) {
            cb(err);
          }
        });
      });
    });
  });
}

/**
 * Log an error message and emit the end of a task
 */
function errorLogger(error) {
    log('*** Start of Error ***'); 
    log(error);
    log('*** End of Error ***');
    //this.emit('end');
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}