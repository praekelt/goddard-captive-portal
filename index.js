
'use strict';

function getAndApplyWhitelist() {
  var http = require('http');
  http.get(process.env.NODE_NODE_JSON, function(res) {
    var json = '';
    res.on('data', function(data) {
      json += data;
    }).on('end', function() {
      var node = JSON.parse(json);
      if (!node.whitelist) {
        console.log('did not find a whitelist in node.json, continuing...');
        return;
      }
      require('./app/mikrotik')(
        node.whitelist.map(function(host) {
          return host.domain;
        })
      );
    });
  }).on('error', function(err) {
    console.log('failed to set up whitelist on mikrotik', err);
  });
}

function checkAppsJson(done) {
  fs.exists(__dirname + '/test/fixtures/apps.json', function(exists) {
    if (!exists) {
      console.log('apps.json not found. fetching from host and writing to disk...');
      var http = require('http');
      http.get(process.env.NODE_APPS_JSON, function(res) {
        var apps = '';
        res.on('data', function(data) {
          apps += data;
        }).on('end', function() {
          fs.writeFile(__dirname + '/test/fixtures/apps.json', apps, function(err) {
            return done(err);
          });
        });
      }).on('error', function(err) {
        return done(err);
      });
    }
    return done();
  });
}

var env = process.env.NODE_ENV || 'dev';
var path = require('path'), fs = require('fs'), os = require('os');
var async = require('async'), express = require('express');
var port = process.env.NODE_PORT || process.env.PORT || 3000;
var paths = {
  log: path.join(__dirname, 'access.log'),
  views: path.join(__dirname, 'app/views'),
  static: path.join(__dirname, 'app/static')
}, access = fs.createWriteStream(paths.log);

process.on('log:access', function(line) {
  access.write(line.join('\t') + os.EOL);
}).on('log:delete', function() {
  access.end(function() {
    fs.unlink(paths.log, function(err) {
      if (err) console.error('HTTP DELETE > unlink access.log:', err);
      access = fs.createWriteStream(paths.log);
    });
  });
}).on('console:log', console.log.bind(console));

var app = express();

env === 'dev' || env.indexOf('test') > -1 ? app.use(require('morgan')('dev')) : 0;
app.set('paths', paths);
app.set('views', paths.views);
app.set('view engine', 'jade');
app.use('/static', express.static(paths.static));
app.use(require('body-parser').urlencoded({extended: true}));

if (!(process.env.NODE_ENV.indexOf('test') > -1)) {
  // set up the mikrotik configure functions to run every two hours
  setInterval(getAndApplyWhitelist, 7200000);
  // but run it once, immediately
  getAndApplyWhitelist();
}

checkAppsJson(function(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log('apps.json already present, continuing...');
  require('./app/routes')(app);
  app.listen(port, function() {
    console.log("✔ server listening at localhost:%s in %s mode...", port, env);
    module.exports = app;
  });
});
