
var mikroApi = require('mikronode');

var endpoints = [
  {
    host: '192.168.88.5',
    commands: [
      '/ip dns static add address=192.168.88.50 comment="supports all the apps for mamawifi.com" name=.*.mamawifi.com',
      '/ip dns static add address=192.168.88.50 comment="default page for mamawifi.com" name=mamawifi.com',
      '/ip hotspot walled-garden remove numbers=[/ip hotspot walled-garden find ]',
      // '/ip hotspot walled-garden add comment="place hotspot rules here" disabled=yes',
      '/ip hotspot walled-garden add dst-host=goddard.com server=hotspot1',
      '/ip hotspot walled-garden add dst-host=*.goddard.com server=hotspot1',
      '/ip hotspot walled-garden ip add action=accept disabled=no dst-address=192.168.88.50 server=*1',
      '/ip hotspot walled-garden add dst-host=www.mamawifi.com server=hotspot1',
      '/ip hotspot walled-garden add dst-host=*.mamawifi.com server=hotspot1',
      '/ip hotspot walled-garden add dst-host=www.surepmch.org server=hotspot1',
      '/ip hotspot walled-garden add dst-host=*.surepmch.org server=hotspot1',
      '/ip hotspot walled-garden add dst-host=www.surepmch.org server=hotspot1',
      '/ip hotspot walled-garden add dst-host=*.surepmch.org server=hotspot1',
      '/ip hotspot walled-garden add dst-host=surepmchreports.org server=hotspot1',
      '/ip hotspot walled-garden add dst-host=*.surepmchreports.org server=hotspot1',
      '/ip hotspot walled-garden add dst-host=dhis2nigeria.org.ng server=hotspot1',
      '/ip hotspot walled-garden add dst-host=*.dhis2nigeria.org.ng server=hotspot1',
      '/ip hotspot walled-garden add dst-host=nigeriahealthwatch.com server=hotspot1',
      '/ip hotspot walled-garden add dst-host=*.nigeriahealthwatch.com server=hotspot1',
      '/ip hotspot walled-garden add dst-host=health-orb.org server=hotspot1',
      '/ip hotspot walled-garden add dst-host=*.health-orb.org server=hotspot1'
    ]
  },
  {
    host: '192.168.88.10',
    commands: ['/interface wireless set [ find name=uksa-ap ] ssid=MAMAConnect']
  }
];

module.exports = function() {
  this.set('mikrotik.configure.configured_flag', false);
  this.set('mikrotik.configure.check', function(cb) {
    var connection = new mikroApi('192.168.88.10', 'admin', 'rogerwilco');
    connection.connect(function(conn) {
      var chan = conn.openChannel();
      chan.write(['/interface/wireless/print'], function() {
        chan.on('done', function(data) {
          chan.close(true);
          conn.close(true);
          if((JSON.stringify(data) || '').toLowerCase().indexOf('mamaconnect') === -1 ) {
            cb(false);
          } else {
            cb(true);
          }
        });
      });
    });
  });
  this.set('mikrotik.configure', function(cb) {
    this.get('mikrotik.configure.check')(function(flagged) {
      if (!flagged) console.log('configuration happening now');
      else {
        console.log('skipping config as already configured');
        return cb();
      }
      // loop and perform the rest in the background
      async.eachLimit(endpoints, 1, function(endpoint, endpointcallback) {
        // construct a connection
        var connection = new mikroApi(endpoint.host, 'admin', 'rogerwilco');
        // do the connect
        connection.connect(function(conn) {

          // loop all the commands
          async.eachSeries(endpoint.commands, function(command_str, command_cb) {

            // debug
            console.log('sending: ' + command_str);

            // connect using ftp
            var Client = require('ftp');
            var c = new Client();

            // !!!
            // are these real event emitters?
            // can they chain?
            c.on('ready', function() {
              // write command to file
              fs.writeFile('line.rsc', command_str, function() {
                c.put('./line.rsc', 'line.rsc', function(err) {
                  if (err) console.log('c.put error:', err);
                  // open the channel
                  var chan = conn.openChannel();
                  // get the ip
                  chan.write(['/import', '=file-name=line.rsc'], function() {
                    chan.on('done', function(data) {
                      console.dir(data);
                      if (data[0][1]) console.log(data[0][1]);
                      chan.close(true);
                      console.log('done with:', command_str);
                      command_cb();
                    });
                  });
                });
              });
            }).on('error', command_cb.bind(command_cb));
            c.connect({
              host: endpoint.host,
              user: 'admin',
              password: 'rogerwilco'
            });
          }, function() {
            // close it
            conn.close(true);
            try {
              connection.end();
            // } catch(err) {
            } finally {
              endpointcallback();
            }
          });
        });
      }, function(err) {
        // set our flag
        this.set('mikrotik.configure.configured_flag', true);
        // done
        console.log('done');
        // call to done
        cb();
      }.bind(this));
    }.bind(this));
  }.bind(this));
};
