
'use strict';

var path = require('path'),
    fs = require('fs'),
    os = require('os');

var express = require('express'),
    app = express(),
    env = process.env.NODE_ENV || 'dev',
    port = process.env.NODE_PORT || 80;

var paths = {
  log: path.join(__dirname, 'access.log'),
  views: path.join(__dirname, 'app/views'),
  static: path.join(__dirname, 'app/static')
};

var access = fs.createWriteStream(paths.log);

process.on('log:access', function(line) {
  access.write(line.join('\t') + os.EOL);
}).on('log:delete', function() {
  access.end(function() {
    fs.unlink(paths.log, function(err) {
      if (err) console.error(err);
      access = fs.createWriteStream(paths.log);
    });
  });
});

app.set('paths', paths);
app.set('views', paths.views);
app.set('view engine', 'jade');
app.use(express.static(paths.static));
app.use(require('body-parser').urlencoded({extended: true}));
if (env === 'dev') app.use(require('morgan')(env));

require('./app/routes')(app, function(app) {
  app.listen(port, function() {
    if (env === 'dev' || env === 'development') {
      console.log("✔ server listening at localhost:%s in %s mode...", port, env);
    }
    module.exports = app;
  });
});
