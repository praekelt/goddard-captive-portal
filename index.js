
'use strict';

var env = process.env.NODE_ENV || 'dev',
    port = process.env.NODE_PORT || 80,
    express = require('express'),
    app = express();

app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/app/static'));
app.use(require('morgan')('dev'));
app.use(require('body-parser').urlencoded({extended: true}));

require('./app/routes')(app, function(app) {
  app.listen(port, function() {
    console.log(
      "✔ server listening at localhost:%s in %s mode...",
      port,
      env
    );
  });
});
