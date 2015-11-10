
'use strict'

var api = require('mikronode');
var endpoint = {
  host: '192.168.88.5',
  username: 'admin',
  password: 'rogerwilco'
}, system_hosts = [
  'goddard.com',
  '*.goddard.com',
  'www.mamawifi.com',
  '*.mamawifi.com'
];

function construct_changes(current, desired) {
  apply_changes(
    desired.filter(function(host) {
      return current.indexOf(host) === -1;
    }).filter(function(host) {
      return !!host;
    }).map(function(host) {
      return '/ip hotspot walled-garden add dst-host="' + host + '" server="hotspot1"';
    }),
    current.filter(function(host) {
      return desired.indexOf(host) === -1;
    }).filter(function(host) {
      return !!host;
    }).map(function(host) {
      return '/ip hotspot walled-garden remove numbers=[/ip hotspot walled-garden find dst-host="' + host + '" ]';
    })
  );
}

function apply_changes(add, remove) {
  if (add.length || remove.length) {
    ftp_config_changes(add.concat(remove).join('\n'), function(err) {
      if (err) console.log('error', err);
    });
  }
}

function ftp_config_changes(change_lines, done) {
  console.log ('WALLED GARDEN CHANGE VIA FTP/IMPORT.');
  console.log(change_lines);
  var connection = new api(endpoint.host, endpoint.username, endpoint.password);
  connection.connect(function(conn) {
    var chan = conn.openChannel();
    var Client = require('ftp');
    var c = new Client();
    c.on('ready', function() {
      console.log("Connected to FTP.");
      var fs = require('fs');
      fs.writeFile(__dirname + '/../../changes.rsc', change_lines, function() {
        c.put(__dirname + '/../../changes.rsc', 'changes.rsc', function(err) {
          c.end();
          if (err) console.log('c.put error:', err);
          var chan = conn.openChannel();
          chan.write(['/import', '=file-name=changes.rsc'], function() {
            chan.on('done', function() {
              console.log('Done with /import.');
              chan.close();
              conn.close(true);
              console.log("END OF WALLED GARDEN CHANGE.");
              done();
            });
          });
        });
      });
    }).on('error', function(err) {
      done(err);
    });
    c.connect({
      host: endpoint.host,
      user: endpoint.username,
      password: endpoint.password
    });
  });
}

module.exports = function(desired_dsthosts) {
  var connection = new api(endpoint.host, endpoint.username, endpoint.password);
  connection.connect(function(conn) {
    var chan = conn.openChannel();
    chan.on('done', function(data) {
      chan.close();
      conn.close(true);
      construct_changes(
        api.parseItems(data).map(function(item) {
          return item['dst-host'];
        }),
        system_hosts.concat(desired_dsthosts)
      );
    }).write('/ip/hotspot/walled-garden/print');
  });
};
