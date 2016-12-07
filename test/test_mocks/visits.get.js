exports.controller = function(req, res, next, server) {

  res.contentType = "application/json";

  incrementVisits(server.store, function(newVal) {
    res.send(200, {
      count: newVal
    });
    next();
  });

};

var incrementVisits = function(store, cb) {
  getVisitsValue(store, function(value) {
    value++;
    setVisitsValue(store, value, function() {
      cb(value);
    });
  });
};
var getVisitsValue = function(store, cb) {
  var defaultValue = 0;
  store.get('visits', function (err, value) {
    if (err) {
      if (err.name === 'NotFoundError') { // doesnt exists - create entry
        setVisitsValue(store, defaultValue, function() {
          cb(defaultValue);
        });
      }
      else {
        return console.log('Storage error', err);
      }
    }
    else {
      cb(value);
    }
  });
};
var setVisitsValue = function(store, value, cb) {
  store.put('visits', value, function (err) {
    if (err) return console.log('Storage error', err); // some kind of I/O error
    cb(null);
  });
};