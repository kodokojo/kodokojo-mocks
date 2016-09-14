var serve = require(__base+'serve.js');

var controller = function(server, route, logger){
  return function(req, res, next){
    serve.getContentByType(server, route.mockType, route.serve, req, res, next).then(function(content){
      res.contentType = route.mockType === 'raw' ? "text/plain" : "application/json";
      res.send(content);
      logger.log('Mock ['+route.method+'] '+route.path+' served');
      next();
    });
  }
};

module.exports = controller;