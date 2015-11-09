
'use strict';

var fs = require('fs');
var http = require('http');
var express = require('express');

exports.apps = function(done) {
  fs.exists(__dirname + '/../../test/fixtures/apps.json', function(exists) {
    if (!exists) {
      console.log('apps.json not found. fetching from host and writing to disk...');
      http.get(process.env.NODE_APPS_JSON || 'http://localhost:8080/apps.json', function(res) {
        var apps = '';
        res.on('data', function(data) {
          apps += data;
        }).on('end', function() {
          fs.writeFile(__dirname + '/../../test/fixtures/apps.json', apps, function(err) {
            return done(err);
          });
        });
      }).on('error', function(err) {
        return done(err);
      });
    }
    return done();
  });
};

exports.whitelist = function() {
  http.get(process.env.NODE_NODE_JSON, function(res) {
    var json = '';
    res.on('data', function(data) {
      json += data;
    }).on('end', function() {
      var node = JSON.parse(json);
      if (!node.whitelist) {
        console.log('did not find a whitelist in node.json, continuing...');
        return;
      }
      require('../mikrotik')(
        node.whitelist.map(function(host) {
          return host.domain;
        })
      );
    });
  }).on('error', function(err) {
    console.log('failed to set up whitelist on mikrotik', err);
  });
};

exports.fixtures = function(done) {
  var fixtures = express();

  fixtures.get('/apps.json', function(req, res) {
    fs.createReadStream(__dirname + '/../../test/fixtures/apps.json').pipe(res);
  });

  fixtures.get('/status.json', function(req, res) {
    fs.createReadStream(__dirname + '/../../test/fixtures/status.json').pipe(res);
  });

  fixtures.get('/build.json', function(req, res) {
    fs.createReadStream(__dirname + '/../../test/fixtures/build.json').pipe(res);
  });

  fixtures.get('/node.json', function(req, res) {
    fs.createReadStream(__dirname + '/../../test/fixtures/node.json').pipe(res);
  });

  fixtures.get('/wireless.html', function(req, res) {
    fs.createReadStream(__dirname + '/../../test/fixtures/wireless.html').pipe(res);
  })

  fixtures.listen(8080, done);
};
