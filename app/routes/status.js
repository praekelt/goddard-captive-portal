
var http = require('http'),
    async = require('async'),
    statusPath = process.env.NODE_STATUS_JSON || 'http://data.goddard.com/status.json',
    nodePath = process.env.NODE_NODE_JSON || 'http://data.goddard.com/node.json',
    buildPath = process.env.NODE_BUILD_JSON || 'http://data.goddard.com/build.json';

var blank = {
  build: {
    "build": "READY",
    "process": "",
    "timestamp": 10
  },
  node: {
    "name": "unnamed",
    "serial": "-1",
    "port": {
      "tunnel": -1,
      "monitor": -1
    },
    "uid": -1,
    "server": "0.0.0.0",
    "publickey": "none"
  },
  status: {
    "node": {
      "cpus": 0,
      "load": "0 0 0",
      "uptime": -1,
      "memory": {
        "total": -1,
        "free": -1
      },
      "disk": {
        "total": -1,
        "free": -1,
        "raid": [
          "INACTIVE",
          "INACTIVE"
        ]
      }
    },
    "wireless": {},
    "router": {},
    "relays": [],
    "bgan": {
      "faults": -1,
      "lat": "-1",
      "lng": "-1",
      "status": "",
      "ethernet": false,
      "usb": false,
      "signal": -1,
      "temp": -1,
      "imsi": "",
      "imei": "",
      "ip": "0.0.0.0",
      "satellite_id": -1
    },
    "nodeid": "0",
    "timestamp": 10
  }
};

module.exports = function(app) {
  app.get(
    process.env.NODE_STATUS_ROUTE || '/status',
    function(req, res) {
      async.parallel({
        wificheck: function(callback) {
          http.get('http://192.168.88.10', function(httpres) {
            httpres.on('data', function(data) {
            }).on('end', function() {
              process.nextTick(function() {
                callback(null, httpres.statusCode >= 200 && httpres.statusCode < 400);
              });
            });
          }).on('error', function(err) {
            process.nextTick(function() { callback(null, false); });
          });
        },
        status: function(callback) {
          http.get(statusPath, function(httpres) {
            var response = '';
            httpres.on('data', function(data) {
              response += data;
            }).on('end', function() {
              process.nextTick(function() {
                if (httpres.statusCode > 200) callback(null, blank.status); 
                else if (response === '' || response === '{}') callback(null, blank.status);
                else callback(null, JSON.parse(response));
              });
            });
          }).on('error', function(err) {
            process.nextTick(function() { callback(err, null); });
          });
        },
        node: function(callback) {
          http.get(nodePath, function(httpres) {
            var response = '';
            httpres.on('data', function(data) {
              response += data;
            }).on('end', function() {
              process.nextTick(function() {
                if (httpres.statusCode > 200) callback(null, blank.node); 
                else if (response === '' || response === '{}') callback(null, blank.node);
                else callback(null, JSON.parse(response));
              });
            });
          }).on('error', function(err) {
            process.nextTick(function() { callback(err, null); });
          });
        },
        build: function(callback) {
          http.get(buildPath, function(httpres) {
            var response = '';
            httpres.on('data', function(data) {
              response += data;
            }).on('end', function() {
              process.nextTick(function() {
                if (httpres.statusCode > 200) callback(null, blank.build); 
                else if (response === '' || response === '{}') callback(null, blank.build);
                else {

                  try {

                    callback(null, JSON.parse(response));

                   } catch(err) { callback(null, blank.build); }

                }
              });
            });
          }).on('error', function(err) {
            process.nextTick(function() { callback(err, null); });
          });
        }
      }, function(err, results) {
        console.dir(results);
        if (err) {
          res.render('status', {
            status: blank.status,
            node: blank.node,
            build: blank.build,
            wifiavailable: false,
            error: err
          });
        } else {
          res.render('status', {
            status: results.status,
            node: results.node,
            wifiavailable: results.wificheck,
            build: results.build
          });
        }
      });
    }
  );
};