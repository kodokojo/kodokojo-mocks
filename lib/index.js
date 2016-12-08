var restify = require('restify');
var Promise = require('bluebird');
var fs = require('fs');
var async = require('async');
var levelup = require('levelup');


// utils
var cusLogger = require(__dirname+'/logger.js');
var findRoot = new require(__dirname+'/findRoot.js');

// root path
global.__base = __dirname + '/';
global.__projectPath = findRoot.getProjectRoot();

// controllers
var reqController = require(__dirname+'/controllers/req.controller.js');

var server = function(params){
  var configDefaults, config, runConfig, state, restifyServer, close, store, allowedMethods;

  configDefaults = [
    { name:'port', defaultVal: 8080 },
    { name:'logs', defaultVal: true },
    { name:'prefix', defaultVal: '' },
    { name:'path', defaultVal: '' },
    { name:'routes', defaultVal: [] }
  ];

  config = params || {};
  runConfig = {};
  state = {
    ready:false
  };
  restifyServer = null;
  close = function(cb) {
    var handler = closeHandler.bind(this);
    handler(cb);
  };
  store = null;
  allowedMethods = [
    'GET',
    'POST',
    'PATCH',
    'OPTIONS',
    'HEAD',
    'PUT',
    'DELETE'
  ];

  this.configDefaults = configDefaults;
  this.config = config;
  this.state = state;
  this.restifyServer = restifyServer;
  this.close = close;
  this.store = store;
  this.allowedMethods = allowedMethods;
};

server.prototype.start = function(){
  var that = this;
  return new Promise(function(resolve, reject){
    async.waterfall([
      function(callback) { // config object
        if(typeof that.config !== 'object') {
          readConfigFile(that).then(function(config){
            that.config = config;
            callback(null);
          }, function(err) {
            reject(err);
          });
        } else {
          callback(null);
        }
      },
      function(callback) { // config defaults
        setDefaultConfig(that, callback);
      },
      function(callback) { // app config
        setRunConfig(that, callback);
      },
      function(callback) {
        setLogger(that, callback);
      },
      function(callback) { // restify server
        that.restifyServer = restify.createServer();
        that.restifyServer.use(restify.bodyParser({ mapParams: false }));
        callback(null);
      },
      function(callback) { // clear tmp folder
        if(that.runConfig.storage.inMemory) {
          callback(null);
        }
        else {
          if(!that.runConfig.storage.persist) {
            clearFolder(that.runConfig.paths.tmpFolder, function(err) {
              if(err) {
                return reject(err);
              }
              callback(null);
            });
          }
          else {
            callback(null);
          }
        }
      },
      function(callback) { // storage
        setTmpFolder(that.runConfig.paths.tmpFolder, function(err) {
          if(err) {
            return reject(err);
          }
          var storeOptions = {};
          if(that.runConfig.storage.inMemory) {
            storeOptions.db = require('memdown');
          }
          try {
            that.store = levelup(that.runConfig.paths.storageFolder, storeOptions);
          }
          catch(e) {
            return reject(e);
          }
          callback(null);
        });
      },
      function(callback) {
        setRoutes(that, function(err){
          if(err) {
            reject(err);
          }
          else {
            callback(null);
          }
        });
      },
      function(callback) {
        that.startServer().then(callback, function(err) {
          reject(err);
        });
      }
    ], function (err) {
      if(err) {
        return reject(err);
      }
      that.state.ready = true;
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
        return reject(err);
      }
      else if(typeof data === 'undefined') {
        return reject( new Error('No config file found at: '+server.config) );
      }
      resolve( JSON.parse(data.toString()) )
    });
  });
};

var setDefaultConfig = function(server, cb){
  server.configDefaults.map(function(defaultProp) {
    server.config[defaultProp.name] = typeof server.config[defaultProp.name] !== 'undefined' ? server.config[defaultProp.name] : defaultProp.defaultVal;
  });
  cb(null);
};
var setRunConfig = function(server, cb){
  server.runConfig = {
    paths: {},
    storage: {
      fileName: server.config.storageDirName ||  'storage',
      inMemory: typeof server.config.memoryStorage !== 'undefined' ? server.config.memoryStorage : false,
      persist: typeof server.config.persistStorage !== 'undefined' ? server.config.persistStorage : false
    }
  };
  server.runConfig.paths.tmpFolder = global.__projectPath+(server.config.path?'/':'')+server.config.path+'/tmp';
  server.runConfig.paths.storageFolder = global.__projectPath+(server.config.path?'/':'')+server.config.path+'/tmp/'+server.runConfig.storage.fileName;
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

var setTmpFolder = function(dirPath, cb){
  if (!fs.existsSync(dirPath)){ // create tmp folder if doesn't exist
    fs.mkdir(dirPath, cb);
  } else {
    cb(null);
  }
};
var clearFolder = function(dirPath, cb){
  if (fs.existsSync(dirPath)){
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { return cb(e); }
    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var filePath = dirPath + '/' + files[i];
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
        else {
          clearFolder(filePath);
        }

      }
    }
    fs.rmdirSync(dirPath);
  }
  if(typeof cb !== 'undefined') {
    cb(null);
  }
};
var closeHandler = function(cb){
  var that = this;
  async.waterfall([
        function(callback) {
          that.restifyServer.close(callback);
        },
        function(callback) {
          that.store.close(callback);
        }],
      function() {
        return (cb ? cb() : false);
      });
};

module.exports = server;