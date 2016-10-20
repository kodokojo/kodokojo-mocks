exports.controller = function(req, res, next) {
  res.contentType = "application/json";
  if( typeof req.params.token !== 'undefined' && req.params.token === 'goodtoken' ) {
    res.send(200, {
      data: 'some data'
    });
  }
  else {
    res.send(403, {
      error: 'Bad token'
    });
  }
  next();
};