
'use strict';

var http = require('http');

var async = require('async');

var manifest = require('../../test/fixtures/apps.json');

var GODDARD_STATUS_ROUTE = process.env.GODDARD_STATUS_ROUTE || '/status';
var GODDARD_STATUS_JSON = process.env.GODDARD_STATUS_JSON || 'http://127.0.0.1:8080/status.json';
var GODDARD_NODE_JSON = process.env.GODDARD_NODE_JSON || 'http://127.0.0.1:8080/node.json';
var GODDARD_BUILD_JSON = process.env.GODDARD_BUILD_JSON || 'http://127.0.0.1:8080/build.json';
var GODDARD_WIFI_PAGE = process.env.GODDARD_WIFI_PAGE || 'http://127.0.0.1:8080/wireless.html';
var GODDARD_MEDIA_RSYNC = process.env.GODDARD_MEDIA_RSYNC || 'http://127.0.0.1:8080/media_rsync.log';
var GODDARD_MEDIA_DU_HUMAN = process.env.GODDARD_MEDIA_DU_HUMAN || 'http://127.0.0.1:8080/media_du_human.log';
var GODDARD_MEDIA_DU_MACHINE = process.env.GODDARD_MEDIA_DU_MACHINE || 'http://127.0.0.1:8080/media_du_machine.log';
var GODDARD_WHITELIST_PATH = process.env.GODDARD_WHITELIST_PATH || 'http://127.0.0.1:8080/whitelist';

var status = {
  default: {
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
  },
  errors: {
    build: [],
    node: [],
    status: [],
    mediaDuHuman: [],
    mediaDuMachine: [],
    mediaRsync: [],
    wificheck: [],
    whitelist: []
  }
};

var manifestTotal = 0;
var subCategories = [];

manifest.categories.forEach(function(category, idx, arr) {
  if (category.categories && !category.media.length) {
    return subCategories.push(idx);
  } else if (!category.media.length) {
    return;
  } else {
    manifestTotal += category.media.map(function(medium) {
      return medium.size;
    }).reduce(function(prev, curr) {
      return prev + curr;
    });
  }
});

if (subCategories.length) {
  subCategories.forEach(function(categoryIdx, idx, arr) {
    manifest.categories[
      categoryIdx
    ].categories.forEach(function(category, idx, arr) {
      if (!category.media.length) return;
      manifestTotal += category.media.map(function(medium) {
        return medium.size;
      }).reduce(function(prev, curr) {
        return prev + current;
      });
    });
  });
}

module.exports = function(app) {

  app.get(GODDARD_STATUS_ROUTE, function(req, res) {
    // reset the error lists for every request
    status.errors.build = [];
    status.errors.node = [];
    status.errors.status = [];
    status.errors.mediaDuHuman = [];
    status.errors.mediaDuMachine = [];
    status.errors.mediaRsync = [];
    status.errors.wificheck = [];
    status.errors.whitelist = [];

    async.parallel({
      whitelist: function(whitelistCallback) {
        http.get(GODDARD_WHITELIST_PATH, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (response === '') {
              status.errors.whitelist.push('no whitelist was found!');
              return whitelistCallback();
            }
            whitelistCallback(null, response);
          });
        }).on('error', function(err) {
          status.errors.whitelist.push(err);
          whitelistCallback();
        });
      },
      mediaDuHuman: function(mediaDuHumanCallback) {
        http.get(GODDARD_MEDIA_DU_HUMAN, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (response === '') {
              status.errors.mediaDuHuman.push(
                'no disk usage data was found in the media disk usage log!'
              );
              return mediaDuHumanCallback();
            }
            mediaDuHumanCallback(null, response);
          });
        }).on('error', function(err) {
          status.errors.mediaDuHuman.push(err);
          mediaDuHumanCallback();
        });
      },
      mediaRsync: function(mediaRsyncCallback) {
        http.get(GODDARD_MEDIA_RSYNC, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (response === '') {
              status.errors.mediaRsync.push(
                'The media sync log is empty. ' +
                'This either means a sync is about to happen, ' +
                'or a sync has never happened.'
              );
              return mediaRsyncCallback();
            }
            mediaRsyncCallback(null, (
              'Total files: '       + /.* (\d+) files to consider/igm.exec(response)[1] + '\n' +
              'Bytes transmitted: ' + /.* sent (\d+) bytes/igm.exec(response)[1]        + '\n' +
              'Bytes received: '    + /.* received (\d+) bytes/igm.exec(response)[1]    + '\n' +
              'Bytes total: '       + /.* total size is (\d+)/igm.exec(response)[1]
            ));
          });
        }).on('error', function(err) {
          status.errors.mediaRsync.push(err);
          mediaRsyncCallback();
        });
      },
      mediaDuMachine: function(mediaDuMachineCallback) {
        http.get(GODDARD_MEDIA_DU_MACHINE, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            var foldersToBytes = {};
            var folderPattern = /\d+\s+(.*)/ig;
            var bytesPattern = /(\d+)\s+.*/ig;
            var lines = response.split('\n').trim();

            var duTotalMinusIrrelevant = lines.filter(function(line, idx, arr) {
              return (
                line.indexOf('.DS_Store') === -1 ||
                line.indexOf('.sh') === -1 ||
                line.indexOf('mp4.3gp') === -1 ||
                line.indexOf('mov.3gp') === -1
              );
            }).map(function(folder, idx, arr) {
              var bytes = parseInt(bytesPattern.exec(folder)[1], 10);
              foldersToBytes[
                folderPattern.exec(folder)[1].split('/').pop()
              ] = (bytes / 1024 / 1024).toPrecision(2);
              return bytes;
            }).reduce(function(prev, curr, idx, arr) {
              return prev + curr;
            });

            mediaDuMachineCallback({
              missingMegabytes: ((manifestTotal - duTotalMinusIrrelevant) / 1024 / 1024).toPrecision(2),
              missingPercentage: ((duTotalMinusIrrelevant / manifestTotal) * 100).toPrecision(2),
              duTotal: (duTotalMinusIrrelevant / 1024 / 1024 / 1024).toPrecision(2),
              manifestTotal: (manifestTotal / 1024 / 1024 / 1024).toPrecision(2),
              duPerFolder: (function(folders) {
                return [
                  Object.keys(folders).map(function(name, idx, arr) {
                    return name + ': ' + folders[name] + 'MB';
                  })
                ];
              })(foldersToBytes)
            });
          });
        }).on('error', function(err) {
          status.errors.mediaDuMachine.push(err);
          mediaDuMachineCallback();
        });
      },
      wificheck: function(wificheckCallback) {
        http.get(GODDARD_WIFI_PAGE, function(httpres) {
          httpres.on('end', function() {
            wificheckCallback(null, httpres.statusCode >= 200 && httpres.statusCode < 400);
          }).on('socket', function(socket) {
            socket.setTimeout(1500);
            socket.on('timeout', function() {
              httpres.abort();
            });
          }).resume();
        }).on('error', function(err) {
          status.errors.wificheck.push(err);
          wificheckCallback(null, false);
        });
      },
      status: function(statusCallback) {
        http.get(GODDARD_STATUS_JSON, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (httpres.statusCode > 200) {
              status.errors.status.push('expected http response code to be `200`, but found it to be `' + httpres.statusCode + '`');
              statusCallback(null, status.default.status);
            } else if (response === '' || response === '{}') {
              status.errors.status.push('expected a full json response but received `' + response + '`');
              statusCallback(null, status.default.status);
            } else {
              try {
                statusCallback(null, JSON.parse(response));
              } catch (err) {
                status.errors.status.push(err);
                statusCallback(null, status.default.status);
              }
            }
          });
        }).on('error', function(err) {
          status.errors.status.push(err);
          statusCallback(null, status.default.status);
        });
      },
      node: function(nodeCallback) {
        http.get(GODDARD_NODE_JSON, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (httpres.statusCode > 200) {
              status.errors.node.push('expected http response code to be `200`, but found it to be `' + httpres.statusCode + '`');
              nodeCallback(null, status.default.node);
            } else if (response === '' || response === '{}') {
              status.errors.node.push('expected a full json response but received `' + response + '`');
              nodeCallback(null, status.default.node);
            } else {
              try {
                nodeCallback(null, JSON.parse(response));
              } catch (err) {
                status.errors.node.push(err);
                nodeCallback(null, status.default.node);
              }
            }
          });
        }).on('error', function(err) {
          status.errors.node.push(err);
          nodeCallback(null, status.default.node);
        });
      },
      build: function(buildCallback) {
        http.get(GODDARD_BUILD_JSON, function(httpres) {
          var response = '';
          httpres.on('data', function(data) {
            response += data;
          }).on('end', function() {
            if (httpres.statusCode > 200) {
              status.errors.build.push('expected http response code to be `200`, but found it to be `' + httpres.statusCode + '`');
              buildCallback(null, status.default.build);
            } else if (response === '' || response === '{}') {
              status.errors.build.push('expected a full json response but received `' + response + '`');
              buildCallback(null, status.default.build);
            } else {
              try {
                buildCallback(null, JSON.parse(response));
              } catch (err) {
                status.errors.build.push(err);
                buildCallback(null, status.default.build);
              }
            }
          });
        }).on('error', function(err) {
          status.errors.build.push(err);
          buildCallback(null, status.default.build);
        });
      }
    }, function(err, results) {
      return res.render('status', {
        errors: status.errors,
        status: results.status,
        node: results.node,
        mediaRsync: results.mediaRsync,
        mediaDuHuman: results.mediaDuHuman,
        mediaDuMachine: results.mediaDuMachine,
        wificheck: results.wificheck,
        build: results.build,
        whitelist: results.whitelist
      });
    });
  });
};
