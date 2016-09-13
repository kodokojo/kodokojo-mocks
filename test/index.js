var assert = require('chai').assert;

// server
var mockServer = require('../lib/index.js');

describe('Server', function() {
  describe('Run', function() {
    it('Should start and return server state', function() {
      var server = new mockServer({
        port: 8080
      });
      server.start(function(server){
        expect(server.state).to.be.an('object');
        expect(server.state).to.include.keys('ready');
        expect(server.state.ready).to.be.true;
      });
    });
  });
});