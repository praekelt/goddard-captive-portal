
'use strict';

var path = require('path'),
    fs = require('fs'),
    os = require('os'),
    async = require('async');

var express = require('express'),
    app = express(),
    env = process.env.NODE_ENV || 'dev',
    port = process.env.NODE_PORT || process.env.PORT || 80,
    configured_flag = false;

var paths = {
  log: path.join(__dirname, 'access.log'),
  views: path.join(__dirname, 'app/views'),
  static: path.join(__dirname, 'app/static')
};

var access = fs.createWriteStream(paths.log);

process.on('log:access', function(line) {
  access.write(line.join('\t') + os.EOL);
}).on('log:delete', function() {
  access.end(function() {
    fs.unlink(paths.log, function(err) {
      if (err) console.error('HTTP DELETE couldnt unlink access.log:', err);
      access = fs.createWriteStream(paths.log);
    });
  });
});

app.set('mikrotik.configure', function(cb){

  // check if file exists
  if(path.existsSync('/var/goddard/20150611-whitelist')) {
    cb(null);
    return;
  } else {
    // write the file
    fs.writeFileSync('/var/goddard/20150611-whitelist', '' + new Date().getTime());
  }

  // hosts to connect and configure
  if(configured_flag === true) {
    cb(null);
    return;
  }

  // done !
  configured_flag = true;

  // loop and connect each
  var endpoints = [ {

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

  },{

    host: '192.168.88.10',
    commands: [

      '/interface wireless set [ find name=uksa-ap ] ssid=MAMAConnect'

    ]

  } ];

  // loop and perform the rest in the background
  async.each(endpoints, function(endpoint, endpointcallback){

    // open a connection
    var mikroApi = require('mikronode')
    var connection = new mikroApi(endpoint.host,'admin','rogerwilco')

    // do the connect
    connection.connect(function(conn){

      // loop all the commands
      async.eachSeries(endpoint.commands, function(command_str, ccb){

        // debug 
        console.log('sending: ' + command_str);

        // connect using ftp
        var Client = require('ftp')
        var c = new Client()
        c.on('ready', function(){

          // write command to file
          fs.writeFile('line.rsc', command_str, function(){

            c.put('./line.rsc', 'line.rsc', function(err) {

              // open the channel
              var chan = conn.openChannel()

              // get the ip
              chan.write([ '/import', '=file-name=line.rsc' ], function(){

                chan.on('done', function(data){
                  console.dir(data);
                  if(data[0][1]) {
                    console.log(data[0][1]);
                  }
                  chan.close(true);

                  console.log('done with: ' + command_str);
                  ccb(null);
                });

              });

            });

          });

        });

        c.on('error', function(err){ ccb(err); });

        // try to connect
        c.connect({

          host: endpoint.host,
          user: 'admin',
          password: 'rogerwilco'

        });
        

      }, function(){

        // close it
        conn.close(true);

        // try to close connection
        try { connection.end(); } catch(err){} 

        // done
        endpointcallback();

      });

    });

  }, function(err){

    // set our flag
    configured_flag = true;

    // done
    console.log('done');

    // call to done
    cb(null);

  });

});

// run the configure function
app.get('mikrotik.configure')(function(){

    console.log('mikrotik configuration done');

});

app.set('paths', paths);
app.set('views', paths.views);
app.set('view engine', 'jade');
app.use(express.static(paths.static));
app.use(require('body-parser').urlencoded({extended: true}));
if (env === 'dev') app.use(require('morgan')(env));

require('./app/routes')(app, function(app) {
  app.listen(port, function() {
    console.log("✔ server listening at localhost:%s in %s mode...", port, env);
    module.exports = app;
  });
});
