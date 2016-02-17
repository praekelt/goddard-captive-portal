
'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');

var async = require('async');
var express = require('express');
var morgan = require('morgan');

var boot = require('./app/boot');

var PORT = process.env.NODE_PORT || process.env.PORT || 3000;
var NODE_ENV = process.env.NODE_ENV || 'dev';
var NODE_TEST_FIXTURES = process.env.NODE_TEST_FIXTURES || false;
var GODDARD_ACCESS_LOG_PATH = process.env.GODDARD_ACCESS_LOG_PATH || path.join(__dirname, 'access.log');
var GODDARD_APP_STATIC_PATH = process.env.GODDARD_APP_STATIC_PATH || path.join(__dirname, 'app/static');
var GODDARD_APP_VIEWS_PATH = process.env.GODDARD_APP_VIEWS_PATH || path.join(__dirname, 'app/views');

var access = fs.createWriteStream(GODDARD_ACCESS_LOG_PATH, {flags: 'a'});

process.on('log:access', function(line) {
  access.write(line.join('\t') + '\n');
}).on('log:delete', function() {
  access.end(function() {
    fs.unlink(GODDARD_ACCESS_LOG_PATH, function(err) {
      if (err) console.error('HTTP DELETE > unlink access.log:', err);
      access = fs.createWriteStream(GODDARD_ACCESS_LOG_PATH, {flags: 'a'});
    });
  });
}).on('console:log', console.log.bind(console));

var app = express();

app.set('paths', {
  log: GODDARD_ACCESS_LOG_PATH,
  views: GODDARD_APP_VIEWS_PATH,
  static: GODDARD_APP_STATIC_PATH
});
app.set('views', GODDARD_APP_VIEWS_PATH);
app.set('view engine', 'jade');
if (NODE_ENV === 'dev') app.use(morgan(NODE_ENV));
app.use('/static', express.static(GODDARD_APP_STATIC_PATH));
app.use(require('body-parser').urlencoded({extended: true}));

if (NODE_TEST_FIXTURES) {
  boot.fixtures(function() {
    boot.apps(function(err) {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      console.log('TEST SUITE - BE PATIENT!');
      console.log('apps.json already present, continuing...');
      require('./app/routes')(app);
      app.listen(PORT, function() {
        console.log("✔ server listening at localhost:%s in %s mode...", PORT, NODE_ENV);
        module.exports = app;
      });
    });
  });
} else {
  boot.apps(function(err) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log('apps.json already present, continuing...');
    require('./app/routes')(app);
    app.listen(PORT, function() {
      console.log("✔ server listening at localhost:%s in %s mode...", PORT, NODE_ENV);
      module.exports = app;
    });
  });
}

