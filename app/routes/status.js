
var http = require('http'),
    async = require('async'),
    statusPath = process.env.NODE_STATUS_JSON || 'http://data.goddard.com/status.json',
    nodePath = process.env.NODE_NODE_JSON || 'http://data.goddard.com/node.json',
    buildPath = process.env.NODE_BUILD_JSON || 'http://data.goddard.com/build.json';

module.exports = function(app) {
  app.get(
    process.env.NODE_STATUS_ROUTE || '/status',
    function(req, res) {
      async.parallel({
        status: function(callback) {
          http.get(statusPath, function(httpres) {
            var response = '';
            httpres.on('data', function(data) {
              response += data;
            }).on('end', function() {
              process.nextTick(function() { callback(null, JSON.parse(response)); });
            }).on('error', function(err) {
              process.nextTick(function() { callback(err, null); });
            });
          });
        },
        node: function(callback) {
          http.get(nodePath, function(httpres) {
            var response = '';
            httpres.on('data', function(data) {
              response += data;
            }).on('end', function() {
              process.nextTick(function() { callback(null, JSON.parse(response)); });
            }).on('error', function(err) {
              process.nextTick(function() { callback(err, null); });
            });
          });
        },
        build: function(callback) {
          http.get(buildPath, function(httpres) {
            var response = '';
            httpres.on('data', function(data) {
              response += data;
            }).on('end', function() {
              process.nextTick(function() { callback(null, JSON.parse(response)); });
            }).on('error', function(err) {
              process.nextTick(function() { callback(err, null); });
            });
          });
        }
      }, function(err, results) {
        var raids = results.status.node.disk.raid;
        results.status.node.disk.raid_healthy = true;
        for (var raid in raids) {
          if (raids[raid] !== 'ACTIVE') {
            results.status.node.disk.raid_healthy = false;
          }
        }

        res.render('status', {
          status: results.status,
          node: results.node || {},
          build: results.build || {}
        });
      });
    }
  );
};