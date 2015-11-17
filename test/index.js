
'use strict';

var chai = require('chai'),
    chakram = require('chakram'),
    fs = require('fs'),
    logPath = require('path').join(__dirname, '../access.log'),
    express = require('express'),
    app;

describe('app', function() {

  before(function(done) {

    // delete `access.log` if it exists
    // before we bootstrap the app

    fs.exists(logPath, function(exists) {
      if (exists) {
        fs.unlink(logPath, function(err) {
          if (err) throw err;
          app = require('../');
          done();
        });
      } else {
        app = require('../');
        done();
      }
    });
  });

  describe('routes', function() {

    describe('/status', function() {

      describe('allowed methods', function() {
        it('should respond to get', function () {
          var request = chakram.get('http://localhost:3000/status');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });
      });

      describe('disallowed methods', function() {

        it('should not respond to post', function() {
          var request = chakram.post('http://localhost:3000/status');
          chakram.expect(request).to.have.status(404);
          return chakram.wait();
        });

        it('should not respond to put', function() {
          var request = chakram.put('http://localhost:3000/status');
          chakram.expect(request).to.have.status(404);
          return chakram.wait();
        });

        it('should not respond to patch', function() {
          var request = chakram.patch('http://localhost:3000/status');
          chakram.expect(request).to.have.status(404);
          return chakram.wait();
        });

        it('should not respond to delete', function() {
          var request = chakram.delete('http://localhost:3000/status');
          chakram.expect(request).to.have.status(404);
          return chakram.wait();
        });
      });
    });

    describe('/', function() {

      before(function(done) {
        // the content system takes a while
        // to initialise...this is really dirty
        // but it's a temporary fix, for now.
        setTimeout(done, 10000);
      });

      describe('allowed methods', function() {
        it('should respond to get', function() {
          var request = chakram.get('http://localhost:3000/');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });
        it('should respond to post', function() {
          var request = chakram.post('http://localhost:3000/');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });
        it('should respond to put', function() {
          var request = chakram.put('http://localhost:3000/');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });
        it('should respond to patch', function() {
          var request = chakram.patch('http://localhost:3000/');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });
        it('should respond to options', function() {
          var request = chakram.options('http://localhost:3000/');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });
        it('should respond to head', function() {
          var request = chakram.head('http://localhost:3000/');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });
        it('should respond to delete', function() {
          var request = chakram.delete('http://localhost:3000/');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });
      });
    });
  });
});
