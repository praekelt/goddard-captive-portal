
'use strict';

var fs = require('fs');

module.exports = function(app) {
  app.get('/log', function(req, res) {
    var accessLog = '';
    fs.createReadStream(app.get('paths').log).on('data', function(data) {
      accessLog += data;
    }).on('end', function() {
      res.set('Content-type', 'text/plain');
      res.status(200).send(accessLog);
      res.end();
    });
  });
  app.delete('/log', function(req, res) {
    process.emit('log:delete');
    res.status(200).end();
  });
};
