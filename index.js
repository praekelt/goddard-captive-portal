
'use strict';

var boot = require('./app/boot');
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
  setInterval(boot.whitelist, 7200000);
  // but run it once, immediately
  boot.whitelist();
}

boot.apps(function(err) {
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
