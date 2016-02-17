
'use strict';

var http = require('http'),
    async = require('async'),
    statusPath = process.env.NODE_STATUS_JSON || 'http://127.0.0.1:8080/status.json',
    nodePath = process.env.NODE_NODE_JSON || 'http://127.0.0.1:8080/node.json',
    buildPath = process.env.NODE_BUILD_JSON || 'http://127.0.0.1:8080/build.json',
    wifiStatusPath = process.env.NODE_WIFI_PAGE || 'http://127.0.0.1:8080/wireless.html',
    mediaSyncLog = process.env.NODE_MEDIA_SYNC_LOG || 'http://127.0.0.1:8080/media_sync.log',
    mediaSizesLog = process.env.NODE_MEDIA_SIZES_LOG || 'http://127.0.0.1:8080/media_sizes.log';

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
  },
  errors: {
    build: [],
    node: [],
    status: [],
    mediaSizes: [],
    mediaSync: [],
    wificheck: [],
  }
};

module.exports = function(app) {
  app.get(process.env.NODE_STATUS_ROUTE || '/status', function(req, res) {

    // reset the error lists for every request
    blank.errors.build = [];
    blank.errors.node = [];
    blank.errors.status = [];
    blank.errors.mediaSizes = [];
    blank.errors.mediaSync = [];
    blank.errors.wificheck = [];

    async.parallel({
      mediaSizes: function(mediaSizesCallback) {
        http.get(mediaSizesLog, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (response === '') {
              blank.errors.mediaSizes.push(
                'no disk usage data was found in the media disk usage log!'
              );
              return mediaSizesCallback();
            }
            mediaSizesCallback(null, response);
          });
        }).on('error', function(err) {
          blank.errors.mediaSizes.push(err);
          mediaSizesCallback();
        });
      },
      mediaSync: function(mediaSyncCallback) {
        http.get(mediaSyncLog, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (response === '') {
              blank.errors.mediaSync.push(
                'the rsync log file is empty. ' +
                'do not panic! ' +
                'it is likely that rsync will start soon and create a new log file.'
              );
              return mediaSyncCallback();
            }
            mediaSyncCallback(null, (
              'Total files: '       + /.* (\d+) files to consider/igm.exec(response)[1] + '\n' +
              'Bytes transmitted: ' + /.* sent (\d+) bytes/igm.exec(response)[1]        + '\n' +
              'Bytes received: '    + /.* received (\d+) bytes/igm.exec(response)[1]    + '\n' +
              'Bytes total: '       + /.* total size is (\d+)/igm.exec(response)[1]
            ));
          });
        }).on('error', function(err) {
          blank.errors.mediaSync.push(err);
          mediaSyncCallback();
        });
      },
      wificheck: function(wificheckCallback) {
        http.get(wifiStatusPath, function(httpres) {
          httpres.on('data', function(data) {
          }).on('end', function() {
            wificheckCallback(null, httpres.statusCode >= 200 && httpres.statusCode < 400);
          }).on('socket', function(socket) {
            socket.setTimeout(1500);
            socket.on('timeout', function() {
              httpres.abort();
            });
          });
        }).on('error', function(err) {
          blank.errors.wificheck.push(err);
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
              blank.errors.status.push('expected http response code to be `200`, but found it to be `' + httpres.statusCode + '`');
              statusCallback(null, blank.status);
            } else if (response === '' || response === '{}') {
              blank.errors.status.push('expected a full json response but received `' + response + '`');
              statusCallback(null, blank.status);
            } else {
              try {
                statusCallback(null, JSON.parse(response));
              } catch (err) {
                blank.errors.status.push(err);
                statusCallback(null, blank.status);
              }
            }
          });
        }).on('error', function(err) {
          blank.errors.status.push(err);
          statusCallback(null, blank.status);
        });
      },
      node: function(nodeCallback) {
        http.get(nodePath, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (httpres.statusCode > 200) {
              blank.errors.node.push('expected http response code to be `200`, but found it to be `' + httpres.statusCode + '`');
              nodeCallback(null, blank.node);
            } else if (response === '' || response === '{}') {
              blank.errors.node.push('expected a full json response but received `' + response + '`');
              nodeCallback(null, blank.node);
            } else {
              try {
                nodeCallback(null, JSON.parse(response));
              } catch (err) {
                blank.errors.node.push(err);
                nodeCallback(null, blank.node);
              }
            }
          });
        }).on('error', function(err) {
          blank.errors.node.push(err);
          nodeCallback(null, blank.node);
        });
      },
      build: function(buildCallback) {
        http.get(buildPath, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (httpres.statusCode > 200) {
              blank.errors.build.push('expected http response code to be `200`, but found it to be `' + httpres.statusCode + '`');
              buildCallback(null, blank.build);
            } else if (response === '' || response === '{}') {
              blank.errors.build.push('expected a full json response but received `' + response + '`');
              buildCallback(null, blank.build);
            } else {
              try {
                buildCallback(null, JSON.parse(response));
              } catch (err) {
                blank.errors.build.push(err);
                buildCallback(null, blank.build);
              }
            }
          });
        }).on('error', function(err) {
          blank.errors.build.push(err);
          buildCallback(null, blank.build);
        });
      }
    }, function(err, results) {
      return res.render('status', {
        errors: blank.errors,
        status: results.status,
        node: results.node,
        mediaSync: results.mediaSync,
        mediaSizes: results.mediaSizes,
        wificheck: results.wificheck,
        build: results.build
      });
    });
  });
};
