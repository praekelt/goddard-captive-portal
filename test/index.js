
var chakram = require('chakram'),
    expect = chakram.expect;

describe('/status route', function() {
  it('should respond to get', function () {
    var request = chakram.get('http://localhost:3000/status');
    expect(request).to.have.status(200);
    return chakram.wait();
  });
  it('should not respond to post', function() {
    var request = chakram.post('http://localhost:3000/status');
    expect(request).to.have.status(404);
    return chakram.wait();
  });
  it('should not respond to put', function() {
    var request = chakram.put('http://localhost:3000/status');
    expect(request).to.have.status(404);
    return chakram.wait();
  });
  it('should not respond to patch', function() {
    var request = chakram.patch('http://localhost:3000/status');
    expect(request).to.have.status(404);
    return chakram.wait();
  });
});

describe('/ route', function() {
  it('should respond to get', function() {
    var request = chakram.get('http://localhost:3000');
    expect(request).to.have.status(200);
    return chakram.wait();
  });
  it('should respond to post', function() {
    var request = chakram.post('http://localhost:3000');
    expect(request).to.have.status(200);
    return chakram.wait();
  });
  it('should respond to put', function() {
    var request = chakram.put('http://localhost:3000');
    expect(request).to.have.status(200);
    return chakram.wait();
  });
  it('should respond to patch', function() {
    var request = chakram.patch('http://localhost:3000');
    expect(request).to.have.status(200);
    return chakram.wait();
  });
  it('should respond to head', function() {
    var request = chakram.head('http://localhost:3000');
    expect(request).to.have.status(200);
    return chakram.wait();
  });
  it('should respond to options', function() {
    var request = chakram.options('http://localhost:3000');
    expect(request).to.have.status(200);
    return chakram.wait();
  });
});
