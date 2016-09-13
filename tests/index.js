var assert = require('chai').assert;

// server
var mockServer = require('../lib/index.js');

describe('Server', function() {
  describe('Run', function() {
    it('Should start and return server state', function() {
      mockServer.start({}, function(state){
        expect(state).to.be.an('object');
        expect(state).to.include.keys('ready');
        expect(state.ready).to.be.true;
      });
    });
  });
});