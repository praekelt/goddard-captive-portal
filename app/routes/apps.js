
var http = require('http');

var path = process.env.NODE_APPS_JSON || 'http://data.goddard.com:8080/apps.json';

var blank = {
  apps: [],
  whitelist: [
    {
      name: 'SURE-P MCH',
      description: 'Committed to improving the health of Nigerian mothers and children.',
      domain: 'www.surepmch.org'
    },
    {
      name: 'SURE-P MCH Reports',
      description: '',
      domain: 'www.surepmchreports.org/login.php'
    },
    {
      name: 'Health Management Information System',
      description: 'Welcome to the National Health Management Information System',
      domain: 'dhis2nigeria.org.ng/dhis/dhis-web-commons/security/login.action'
    },
    {
      name: 'Nigeria Health Watch',
      description: 'Informed commentary, intelligence and insights on the Nigerian Health sector',
      domain: 'nigeriahealthwatch.com'
    },
    {
      name: 'Health-Orb',
      description: 'Connecting Frontline Health Workers to resources and each other to expand their knowledge, organize content into courses, and share their learning with the community.',
      domain: 'health-orb.org'
    }
  ]
};

/**
* Checks if the new settings have already been applied.
**/

module.exports = function(app) {
  app.all(
    process.env.NODE_APPS_ROUTE || '/',
    function(req, res) {
      // redirect to mamawifi.com if still on goddard.com
      if(req.hostname.toLowerCase().indexOf('mamawifi') === -1 && 1==2) {
        
        res.redirect('http://mamawifi.com');

      } else {

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
          var apps = '';
          httpres.on('data', function(data) {
            apps += data;
          }).on('end', function() {
            process.nextTick(function() {
              if (httpres.statusCode > 200) {
                return res.render('apps', {
                  apps: blank.app,
                  whitelist: blank.whitelist,
                  error: {message: 'connect ECONNREFUSED'}
                });
              } else if (apps === '' || apps === '{}') {
                return res.render('apps', {
                  apps: blank.apps,
                  whitelist: blank.whitelist
                });
              } else {
                return res.render('apps', {
                  apps: JSON.parse(apps),
                  whitelist: blank.whitelist
                });
              }
            });
          });
        }).on('error', function(err) {
          return res.render('apps', {
            apps: blank.apps,
            whitelist: blank.whitelist,
            error: {message: 'connect ECONNREFUSED'}
          });
        });

      }
    }
  );
};
