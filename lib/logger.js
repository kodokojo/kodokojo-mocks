var logger = function(params){
  this.config = params || {
      enabled: true
    };
};

// TODO: use a logging lib
logger.prototype.log = function(input){
  if(this.config.enabled) {
    console.log(input);
  }

};

module.exports = logger;