var fs = require('fs');
var Promise = require('bluebird');

readFile = function(path){
  return new Promise(function(resolve, reject){
    fs.readFile(path, "utf-8", function(err, data) {
      if(err) {
        reject(err);
      }
      resolve( data.toString() )
    });
  });
};

runCustomController = function(path, req, res, next){
  var controllerModule = require(path).controller(req, res, next);
};

bindMockMarkers = function(content, params){
  for(var i in params) {
    content = content.replace(new RegExp('{{req.'+i+'}}', 'g'), params[i]);
  }
  return content;
};

exports.getContentByType = function(server, type, toServe, req, res, next){
  return new Promise(function(resolve, reject){
    if(type === 'file') {
      readFile(server.config.path+'/'+toServe).then(function(content){
        resolve( JSON.parse(bindMockMarkers(content, req.params)) )
      }, reject);
    } else if(type === 'func') {
      runCustomController(server.config.path+'/'+toServe, req, res, next);
    } else if(type === 'raw') {
      resolve( bindMockMarkers(toServe, req.params) )
    } else {
      reject( new Error('Unknown mockType') );
    }
  });
};