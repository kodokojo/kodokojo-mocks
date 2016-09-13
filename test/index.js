var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

// server
var mockServer = require('../lib/index.js');

describe('Server', function() {
  describe('Run', function() {
    it('Should start and return server state', function() {
      var server = new mockServer({
        port: 8090,
        logs: false
      });
      return server.start().then(function(state){
          expect(server.state).to.be.an('object');
          expect(server.state).to.include.keys('ready');
          expect(server.state.ready).to.be.true;
      })
    });
  });
});