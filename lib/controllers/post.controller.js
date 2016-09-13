var controller = function(req, res, next){
  res.send('hello ' + req.params.name);
  next();
};

module.exports = controller;