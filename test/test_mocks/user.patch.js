exports.controller = function(req, res, next) {
  res.contentType = "application/json";
  if( typeof req.body.username !== 'undefined') {
    res.send(200, {
      username: req.body.username
    });
  }
  next();
};