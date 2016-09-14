var restify = require('restify');
var Promise = require('bluebird');
var fs = require('fs');
var async = require('async');

// root path
global.__base = __dirname + '/';

// utils
var cusLogger = new require(__dirname+'/logger.js');
// controllers
var reqController = require(__dirname+'/controllers/req.controller.js');

var server = function(params){
  var config, state, restifyServer, close, allowedMethods;

  config = params || {
      port: 8080,
      logs: true,
      prefix:'',
      routes: []
    };
  state = {
    ready:false
  };

  restifyServer = restify.createServer();
  close = function(){
    restifyServer.close();
  };

  allowedMethods = [
    'GET',
    'POST',
    'PATCH',
    'OPTIONS',
    'HEAD',
    'PUT',
    'DELETE'
  ];

  this.config = config;
  this.state = state;
  this.restifyServer = restifyServer;
  this.close = close;
  this.allowedMethods = allowedMethods;
};

server.prototype.start = function(){
  var that = this;

  return new Promise(function(resolve, reject){

    async.waterfall([
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
      },
      function(callback) {
        setDefaultConfig(that, callback);
      },
      function(callback) {
        setLogger(that, callback);
      },
      function(callback) {
        setRoutes(that, function(err){
          if(err) {
            reject(err);
          }
          else {
            callback();
          }
        });
      },
      function startRestifyServer(callback) {
        that.startServer().then(callback, function(err) {
          reject(err);
        });
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
      resolve(null);
    });
  });
};

var readConfigFile = function(server, cb){
  return new Promise(function(resolve, reject){
    fs.readFile(server.config, "utf-8", function(err, data) {
      if(err) {
        reject(err);
      }
      resolve( JSON.parse(data.toString()) )
    });
  });
};

var setDefaultConfig = function(server, cb){
  server.config = {
    port: server.config.port || 8080,
    logs: server.config.logs || true,
    prefix: server.config.prefix || '',
    path: server.config.path || '',
    routes: server.config.routes || []
  };
  cb(null);
};

var setLogger = function(server, cb){
  server.logger = new cusLogger({
    enabled: server.config.logs
  });
  cb(null);
};

var setRoutes = function(server, cb){
  for(var i=0; i<server.config.routes.length; i++) {
    var route = server.config.routes[i];
    if( server.allowedMethods.indexOf(route.method) !== -1 ) {
      var methodToLowerCase = route.method.toLowerCase();
      server.restifyServer[methodToLowerCase](server.config.prefix+route.path, new reqController(server, route, server.logger));
    }
    else {
      return cb( new Error('Method '+route.method+' not allowed') );
    }
  }
  cb(null);
};

module.exports = server;