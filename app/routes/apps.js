
var http = require('http');

var path = process.env.NODE_APPS_JSON || 'http://data.goddard.com:8080/apps.json';

module.exports = function(app) {
  app.all(
    process.env.NODE_APPS_ROUTE || '/',
    function(req, res) {
      var apps = '';
      if (req.method === 'POST' || req.method === 'post') {
        process.emit(
          'log:access',
          [
            Date.now(),
            req.body.mac || 'unknown',
            req.body.ip || 'unknown',
            req.get('user-agent') || 'unknown'
          ]
        );
      }
      http.get(path, function(httpres) {
        httpres.on('data', function(data) {
          apps += data;
        }).on('end', function() {
          process.nextTick(function() {
            res.render('apps', {apps: JSON.parse(apps)});
          });
        }).on('error', function(err) {
          console.error('apps.js http error', err);
        });
      });
    }
  );
};
