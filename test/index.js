var chai = require('chai');
var request = require('request');
var expect = chai.expect;

// server
var mockServer = require('../lib/index.js');

describe('Server', function() {
  describe('Run', function() {
    it('Should start and return server state ready', function(done) {
      var server = new mockServer({
        port: Math.floor(Math.random() * 9000) + 8000, // Random port to ensure binding efficiency  
        logs: false,
        routes: [],
        path: "test/test_mocks",
        memoryStorage: true
      });
      server.start().then(function(state){
        expect(state).to.be.an('object');
        expect(state).to.include.keys('ready');
        expect(state.ready).to.be.true;
        server.close(done);
      })
    });
  });
  describe('Set config', function() {
    it('Should read and parse config file', function(done) {
      var server = new mockServer(__dirname+"/test_mocks/test_config.json");
      server.start().then(function(state){
        expect(server.config).to.be.an('object');
        expect(server.config.routes).to.be.an('array');
        expect(server.config.routes).to.deep.include({"path":"/user","method":"POST","mockType":"raw","serve":"0821b5c16a367e5df4044b183af3f0d18235d832"});
        server.close(done);
      });
    });
    it('Should convert routes from config file to restify routes', function(done) {
      var server = new mockServer(__dirname+"/test_mocks/test_config.json");
      server.start().then(function(state){
        var recordedPostRoute = server.restifyServer.router.mounts.postapiv1user.spec;
        expect(recordedPostRoute).to.be.an('object');
        expect(recordedPostRoute).to.include.keys('path');
        expect(recordedPostRoute.path).to.be.equal('api/v1/user');
        expect(recordedPostRoute.method).to.be.equal('POST');
        server.close(done);
      });
    });
  });
  describe('Mock Serve', function() {
    it('Should serve an ID', function(done) {
      var server = new mockServer(__dirname+"/test_mocks/test_config.json");
        server.start().then(function(state){
         request.post({
           url: 'http://localhost:'+server.config.port+'/'+server.config.prefix+server.config.routes[0].path
         }, function(error, response, body){
           expect(error).to.be.null;
           expect(body).to.equal(server.config.routes[0].serve);
           server.close(done);
         });
      });
    });
    it('Should serve a user object based on a given ID', function(done) {
      var server = new mockServer(__dirname+"/test_mocks/test_config.json");
      server.start().then(function(state){
        request.get({
          url: 'http://localhost:'+server.config.port+'/'+server.config.prefix+(server.config.routes[1].path.replace(':id','1'))
        }, function(error, response, body){
          var data = JSON.parse(body);
          expect(error).to.be.null;
          expect(Object.keys(data).length).to.equal(10);
          server.close(done);
        });
      });
    });
    it('Should serve "some data" depending on a given good token', function(done) {
      var server = new mockServer(__dirname+"/test_mocks/test_config.json");
      server.start().then(function(state){
        request.get({
          url: 'http://localhost:'+server.config.port+'/'+server.config.prefix+(server.config.routes[3].path.replace(':token','goodtoken'))
        }, function(error, response, body){
          var data = JSON.parse(body);
          expect(error).to.be.null;
          expect(data).to.be.an('object');
          expect(data.data).to.equal('some data');
          server.close(done);
        });
      });
    });
    it('Should serve "new_username" depending on a given data from a patch request', function(done) {
      var server = new mockServer(__dirname+"/test_mocks/test_config.json");
      server.start().then(function(state){
        var options = {
          method: 'PATCH',
          url: 'http://localhost:'+server.config.port+'/'+server.config.prefix+server.config.routes[2].path,
          headers:
          {
            'content-type': 'application/json'
          },
          body: {
            username: "new_username"
          },
          json: true
        };
        request(options, function(error, response, body){
          expect(error).to.be.null;
          expect(body).to.be.an('object');
          expect(body.username).to.equal('new_username');
          server.close(done);
        });
      });
    });
    it('Should add +3 to visits count', function(done) {
      var server = new mockServer(__dirname+"/test_mocks/test_config.json");
      server.start().then(function(state){
        var options = {
          method: 'GET',
          url: 'http://localhost:'+server.config.port+'/'+server.config.prefix+server.config.routes[4].path
        };
        function doReq(count, max, cb) {
          if(count<max) {
            request(options, function(error, response, body){
              var data = JSON.parse(body);
              expect(data.count).to.equal(count);
              doReq(count+1, max, cb)
            });
          }
          else {
            cb(null);
          }
        }
        doReq(1, 3, function() { // increment 3 visits
          server.close(done);
        });
      });
    });
  });
});
