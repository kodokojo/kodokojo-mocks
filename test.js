var mockServer = require('./lib/index.js');

var server = new mockServer(__dirname+"/test/test_mocks/test_config.json");
return server.start().then(function(state){
 //console.log(state);
 //console.log(server.config);
});