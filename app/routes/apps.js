
var path = process.env.NODE_APPS_JSON || 'http://goddard/apps.json';

var apps = [
  { name: 'MAMA',
    description: 'Our mission is to engage an innovative global community to deliver vital health information to new and expectant mothers through mobile phones. Our guiding principles are scale, sustainability, and impact.',
    link: 'http://mama.goddard',
    logo: 'http://goddard/logos/mama.png',
    id: 111 }
];

module.exports = function(app) {
  app.all(
    process.env.NODE_APPS_ROUTE || '/',
    function(req, res) {

      res.render('apps', {apps: apps});

    }
  );
};
