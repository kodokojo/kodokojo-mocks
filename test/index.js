var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

// server
var mockServer = require('../lib/index.js');

describe('Server', function() {
  describe('Run', function() {
    it('Should start and return server state ready', function() {
      var server = new mockServer({
        port: Math.floor(Math.random() * 9000) + 8000, // Random port to ensure binding efficiency  
        logs: false,
        routes: []
      });
      return server.start().then(function(state){
        expect(state).to.be.an('object');
        expect(state).to.include.keys('ready');
        expect(state.ready).to.be.true;
        server.close();
      })
    });
  });
  describe('Set config', function() {
    it('Should read and parse config file', function() {
      var server = new mockServer(__dirname+"/test_mocks/test_config.json");
      return server.start().then(function(state){
        expect(server.config).to.be.an('object');
        expect(server.config.routes).to.be.an('array');
        expect(server.config.routes).to.deep.include({"path":"/user","method":"POST","mockType":"raw","serve":"0821b5c16a367e5df4044b183af3f0d18235d832"});
        server.close();
      });
    });
    it('Should convert routes from config file to restify routes', function() {
      var server = new mockServer(__dirname+"/test_mocks/test_config.json");
      return server.start().then(function(state){
        var recordedPostRoute = server.restifyServer.router.mounts.postapiv1user.spec;
        expect(recordedPostRoute).to.be.an('object');
        expect(recordedPostRoute).to.include.keys('path');
        expect(recordedPostRoute.path).to.be.equal('api/v1/user');
        expect(recordedPostRoute.method).to.be.equal('POST');
        server.close();
      });
    });
  });
});
