
var http = require('http');

var path = process.env.NODE_APPS_JSON || 'http://goddard.com/apps.json';

var apps = [
  { name: 'MAMA',
    description: 'Our mission is to engage an innovative global community to deliver vital health information to new and expectant mothers through mobile phones. Our guiding principles are scale, sustainability, and impact.',
    link: 'http://mama.goddard.com',
    logo: 'http://goddard.com/logos/mama.png',
    id: 111 }
];

function production(app) {
  app.all(
    process.env.NODE_APPS_ROUTE || '/',
    function(req, res) {

      var apps = '';

      http.get(path, function(res) {
        res.on('data', function(data) {
          apps += data;
        }).on('end', function() {
          process.nextTick(function() {
            var parsed = JSON.parse(apps);

            process.nextTick(function() {
              res.render('apps', {apps: parsed});
            });
          });
        });
      });
    }
  );
}

function development(app) {
  app.all(
    process.env.NODE_APPS_ROUTE || '/',
    function(req, res) {
      res.render('apps', {apps: apps});
    }
  );
}

if (process.env.NODE_ENV === 'production') {
  module.exports = production;
} else {
  module.exports = development;
}
