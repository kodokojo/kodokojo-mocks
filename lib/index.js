var restify = require('restify');
var Promise = require('bluebird');
var fs = require('fs');
var async = require('async');

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

    async.waterfall([
      function startRestifyServer(callback) {
        that.startServer().then(callback, function(err) {
          reject(err);
        });
      },
      function(callback) {
        that.state.ready = true;
        // set config
        if(typeof that.config !== 'object') {
          readConfigFile(that).then(function(config){
            that.config = config;
            callback();
          }, function(err) {
            reject(err);
          });
        } else {
          callback();
        }
      }
    ], function (err, result) {
      that.logger.log('Kodokojo-mocks server listening at port: '+that.config.port);
      resolve(that.state);
    });

  });


};

server.prototype.startServer = function(){
  var that = this;
  return new Promise(function(resolve, reject){
    that.restifyServer.listen(that.config.port, function() {
      resolve();
    });
  });
};

var readConfigFile = function(server, cb){
  return new Promise(function(resolve, reject){
    fs.readFile(server.config, "utf-8", function(err, data) {
      if(err) {
        reject(err);
      }
      var configFileContent = fs.readFileSync(server.config);
      resolve( JSON.parse(configFileContent.toString()) )
    });
  });
};

var setRoutes = function(server, cb){
  if(typeof server.config.routes !== 'object') {
    server.config.routes = JSON.parse(server.config.routes);
  }
  cb();
};

module.exports = server;