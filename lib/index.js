var restify = require('restify');
var Promise = require('bluebird');

// utils
var cusLogger = new require(__dirname+'/logger.js');
// controllers
var getCtrl = require(__dirname+'/controllers/post.controller.js');

var server = function(params){
  var config, state, restifyServer, logger, setRoutes;

  config = params || {
      port: 8080,
      logs: true,
      routes: []
    };
  state = {
    ready:false
  };
  restifyServer = restify.createServer();
  logger = new cusLogger({
    enabled:config.logs
  });

  this.config = config;
  this.state = state;
  this.restifyServer = restifyServer;
  this.logger = logger;
};

server.prototype.start = function(){
  var that = this;
  return new Promise(function(resolve, reject){
    that.restifyServer.listen(that.config.port, function() {
      that.state.ready = true;
      that.logger.log('Kodokojo-mocks server listening at port: '+that.config.port);

      // setting routes
      setRoutes(that, function(err){
        if(err) {
          reject(err);
        }
        else {
          resolve(that.state);
        }
      });

    });
  });
};

var setRoutes = function(server, cb){
  if(typeof server.config.routes !== 'object') {
    server.config.routes = JSON.parse(server.config.routes);
  }

  console.log(server.config.routes);
  cb();
};

module.exports = server;