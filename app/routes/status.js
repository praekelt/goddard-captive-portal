
'use strict';

var http = require('http'),
    async = require('async'),
    statusPath = process.env.NODE_STATUS_JSON || 'http://127.0.0.1:8080/status.json',
    nodePath = process.env.NODE_NODE_JSON || 'http://127.0.0.1:8080/node.json',
    buildPath = process.env.NODE_BUILD_JSON || 'http://127.0.0.1:8080/build.json',
    wifiStatusPath = process.env.NODE_WIFI_PAGE || 'http://127.0.0.1:8080/wireless.html',
    mediaSyncLog = process.env.NODE_MEDIA_SYNC_LOG || 'http://127.0.0.1:8080/media_sync.log';

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
  app.get(process.env.NODE_STATUS_ROUTE || '/status', function(req, res) {
    async.parallel({
      mediaSync: function(mediaSyncCallback) {
        http.get(mediaSyncLog, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            mediaSyncCallback(null, response);
          });
        }).on('error', function(err) {
          mediaSyncCallback(err);
        });
      },
      wificheck: function(wificheckCallback) {
        http.get(wifiStatusPath, function(httpres) {
          httpres.on('data', function(data) {
          }).on('end', function() {
            wificheckCallback(null, httpres.statusCode >= 200 && httpres.statusCode < 400);
          }).on('socket', function (socket) {
            socket.setTimeout(1500);
            socket.on('timeout', function() {
              httpres.abort();
            });
          });
        }).on('error', function(err) {
          wificheckCallback(null, false);
        });
      },
      status: function(statusCallback) {
        http.get(statusPath, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (httpres.statusCode > 200) {
              statusCallback(null, blank.status);
            } else if (response === '' || response === '{}') {
              statusCallback(null, blank.status);
            } else {
              statusCallback(null, JSON.parse(response));
            }
          });
        }).on('error', function(err) {
          statusCallback(err, null);
        });
      },
      node: function(nodeCallback) {
        http.get(nodePath, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (httpres.statusCode > 200) {
              nodeCallback(null, blank.node);
            } else if (response === '' || response === '{}') {
              nodeCallback(null, blank.node);
            } else {
              nodeCallback(null, JSON.parse(response));
            }
          });
        }).on('error', function(err) {
          nodeCallback(err, null);
        });
      },
      build: function(buildCallback) {
        http.get(buildPath, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (httpres.statusCode > 200) {
              buildCallback(null, blank.build);
            } else if (response === '' || response === '{}') {
              buildCallback(null, blank.build);
            } else {
              try {
                buildCallback(null, JSON.parse(response));
              } catch(err) {
                buildCallback(null, blank.build);
              }
            }
          });
        }).on('error', function(err) {
          buildCallback(err, null);
        });
      }
    }, function(err, results) {
      if (err) {
        return res.render('status', {
          status: blank.status,
          node: blank.node,
          build: blank.build,
          wifiavailable: false,
          mediaSync: false,
          error: err
        });
      } else {
        return res.render('status', {
          status: JSON.stringify(results.status) == '{}' ? blank.status : results.status,
          node: results.node,
          mediaSync: results.mediaSync,
          wifiavailable: results.wificheck,
          build: results.build
        });
      }
    });
  });
};
