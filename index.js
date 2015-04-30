
'use strict';

var path = require('path'),
    accessLogPath = path.join(__dirname, 'access.log'),
    env = process.env.NODE_ENV || 'dev',
    port = process.env.NODE_PORT || 80,
    express = require('express'),
    app = express(),
    fs = require('fs'),
    os = require('os'),
    access = fs.createWriteStream(accessLogPath);

process.on('log:access', function(line) {
  access.write(line.join('\t') + os.EOL);
}).on('log:delete', function() {
  access.end(function() {
    fs.unlink(accessLogPath, function(err) {
      if (err) console.error(err);
      access = fs.createWriteStream(accessLogPath);
    });
  });
});

app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'app/static')));
app.use(require('morgan')('dev'));
app.use(require('body-parser').urlencoded({extended: true}));

require('./app/routes')(app, function(app) {
  app.listen(port, function() {
    console.log(
      "✔ server listening at localhost:%s in %s mode...",
      port,
      env
    );
    module.exports = app;
  });
});
