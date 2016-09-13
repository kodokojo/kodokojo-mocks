var logger = function(params){
  this.conf = params || {
      enabled: true
    };
};

// TODO: use a logging lib
logger.prototype.log = function(input){
  if(this.conf.enabled) {
    console.log(input);
  }

};

module.exports = logger;