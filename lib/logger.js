var logger = function(params){
  this.conf = params || {
      enabled: true
    };
};

logger.prototype.log = function(input){
  if(this.conf.enabled) {
    console.log(input);
  }

};

module.exports = logger;