
'use strict';

var fs = require('fs');

var GODDARD_LOG_ROUTE = process.env.GODDARD_LOG_ROUTE || '/log';

module.exports = function(app) {
  app.get(GODDARD_LOG_ROUTE, function(req, res) {
    res.status(200);
    res.set('Content-type', 'text/plain');
    fs.createReadStream(app.get('paths').log).pipe(res);
  });
  app.delete('/log', function(req, res) {
    process.emit('log:delete');
    res.status(200).end();
  });
};
