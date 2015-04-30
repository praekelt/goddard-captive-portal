
var fs = require('fs'),
    path = require('path'),
    accessLogPath = path.join(__dirname, '..', '..', 'access.log');

function logGet(app) {
  app.get('/log', function(req, res) {
    var access = fs.createReadStream(accessLogPath),
        accessLog = '';

    access.on('data', function(data) { accessLog += data; });
    access.on('end', function() {
      res.set('Content-type', 'text/plain');
      res.status(200).send(accessLog);
      res.end();
    });
  });
}

function logDelete(app) {
  app.delete('/log', function(req, res) {
    process.emit('log:delete');
    res.status(200).end();
  });
}

module.exports = function(app) {
  logGet(app);
  logDelete(app);
};
