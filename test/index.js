
var chai = require('chai'),
    chakram = require('chakram'),
    fs = require('fs'),
    path = require('path'),
    accessLogPath = path.join(__dirname, '..', 'access.log'),
    app = require('../index');

describe('app', function() {

  describe('access.log', function() {

    it('should exist at application bootstrap', function(done) {
      fs.exists(accessLogPath, function(exists) {
        chai.expect(exists).to.be.ok;
        done();
      });
    });

    it('should be empty at application\'s first ever bootstrap', function(done) {
      fs.readFile(accessLogPath, function(err, data) {
        chai.expect(err).to.not.be.ok;
        chai.expect(data.toString()).to.equal('');
        done();
      });
    });

    it('should add a line when POST / is hit', function(done) {
      chakram.post(
        'http://localhost:3000/',
        'mac=AD%3A03%3ASD%3A4D%3A34%3A12&ip=192.168.23.23'
      ).then(function(response) {
        fs.readFile(accessLogPath, function(err, data) {
          chai.expect(err).to.not.be.ok;
          chai.expect(data.toString()).to.not.equal('');
          done();
        });
      });
    });

    it('should return the contents of access.log when GET /log is hit', function(done) {
      chakram.get('http://localhost:3000/log').then(function(response) {
        chai.expect(response.body).to.not.equal('');
      }).then(done);
    });

    it('should delete and then recreate access.log when DELETE /log is hit', function(done) {

      fs.watch(accessLogPath, function(event, filename) {

        if (process.platform === 'darwin') {
          chai.expect(event).to.equal('rename');
        } else {
          chai.expect(event).to.equal('change');
        }

        done();
      });

      var request = chakram.delete('http://localhost:3000/log');
      chakram.expect(request).to.have.status(200);
      return chakram.wait();
    });
  });

  describe('routes', function() {

    describe('/', function() {

      describe('allowed methods', function() {

        it('should respond to get', function() {
          var request = chakram.get('http://localhost:3000');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });

        it('should respond to post', function() {
          var request = chakram.post('http://localhost:3000');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });

        it('should respond to put', function() {
          var request = chakram.put('http://localhost:3000');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });

        it('should respond to patch', function() {
          var request = chakram.patch('http://localhost:3000');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });

        it('should respond to head', function() {
          var request = chakram.head('http://localhost:3000');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });

        it('should respond to options', function() {
          var request = chakram.options('http://localhost:3000');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });

        it('should respond to delete', function() {
          var request = chakram.delete('http://localhost:3000');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });
      });
    });

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

    describe('/log', function() {

      describe('allowed methods', function() {

        it('should respond to get', function () {
          var request = chakram.get('http://localhost:3000/log');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });

        it('it should respond to delete', function() {
          var request = chakram.delete('http://localhost:3000/log');
          chakram.expect(request).to.have.status(200);
          return chakram.wait();
        });
      });

      describe('disallowed methods', function() {

        it('should not respond to post', function() {
          var request = chakram.post('http://localhost:3000/log');
          chakram.expect(request).to.have.status(404);
          return chakram.wait();
        });

        it('should not respond to put', function() {
          var request = chakram.put('http://localhost:3000/log');
          chakram.expect(request).to.have.status(404);
          return chakram.wait();
        });

        it('should not respond to patch', function() {
          var request = chakram.patch('http://localhost:3000/log');
          chakram.expect(request).to.have.status(404);
          return chakram.wait();
        });
      });
    });
  });
});
