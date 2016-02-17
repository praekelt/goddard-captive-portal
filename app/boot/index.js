
'use strict';

var fs = require('fs');
var http = require('http');

var NODE_TEST_FIXTURES_PORT = process.env.NODE_TEST_FIXTURES_PORT || 1337;
var GODDARD_APPS_JSON = process.env.GODDARD_APPS_JSON ||
  'http://localhost:' + NODE_TEST_FIXTURES_PORT + '/apps.json';
var GODDARD_NODE_JSON = process.env.GODDARD_NODE_JSON ||
  'http://localhost' + NODE_TEST_FIXTURES_PORT + ':8080/node.json';

exports.apps = function(done) {
  fs.exists(__dirname + '/../../test/fixtures/apps.json', function(exists) {
    if (exists) return done();
    console.log('apps.json not found. fetching from host and writing to disk...');
    http.get(GODDARD_APPS_JSON, function(res) {
      res.pipe(
        fs.createWriteStream(
          __dirname + '/../../test/fixtures/apps.json'
        ).on('end', done).on('error', done)
      );
    }).on('error', done);
  });
};

exports.whitelist = function() {
  http.get(GODDARD_NODE_JSON, function(res) {
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

  console.log('fixtures requested, enabling...');

  var express = require('express');
  var fixtures = express();

  fixtures.get('/apps.json', function(req, res) {
    fs.createReadStream(
      __dirname + '/../../test/fixtures/apps.json'
    ).pipe(res);
  });

  fixtures.get('/status.json', function(req, res) {
    fs.createReadStream(
      __dirname + '/../../test/fixtures/status.json'
    ).pipe(res);
  });

  fixtures.get('/build.json', function(req, res) {
    fs.createReadStream(
      __dirname + '/../../test/fixtures/build.json'
    ).pipe(res);
  });

  fixtures.get('/node.json', function(req, res) {
    fs.createReadStream(
      __dirname + '/../../test/fixtures/node.json'
    ).pipe(res);
  });

  fixtures.get('/wireless.html', function(req, res) {
    fs.createReadStream(
      __dirname + '/../../test/fixtures/wireless.html'
    ).pipe(res);
  });

  fixtures.listen(NODE_TEST_FIXTURES_PORT, done);
};
