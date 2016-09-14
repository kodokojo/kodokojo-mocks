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

bindMockMarkers = function(content, params){
  for(var i in params) {
    content = content.replace(new RegExp('{{req.'+i+'}}', 'g'), params[i]);
  }
  return content;
};

exports.getContentByType = function(server, type, toServe, reqParams){
  return new Promise(function(resolve, reject){
    if(type === 'file') {
      readFile(server.config.path+'/'+toServe).then(function(content){
        resolve( JSON.parse(bindMockMarkers(content, reqParams)) )
      }, reject);
    } else {
      resolve( bindMockMarkers(toServe, reqParams) )
    }
  });
};